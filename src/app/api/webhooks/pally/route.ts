import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // В зависимости от того, как Pally отправляет данные (JSON или form-data)
    const text = await request.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = Object.fromEntries(new URLSearchParams(text));
    }

    // Логируем для отладки
    console.log('Pally Webhook Received:', data);

    const orderId = data.order_id || data.InvId || '';
    const status = data.status || data.Status;
    const amount = data.amount || data.OutSum || '';
    const receivedSignature = data.signature || data.SignatureValue;

    // 1. Verify signature if present
    const PALLY_SECRET_KEY = process.env.PALLY_SECRET_KEY;
    if (!PALLY_SECRET_KEY) {
      console.error('Webhook Error: PALLY_SECRET_KEY is not defined in environment variables');
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    if (receivedSignature) {
      const signString = `${amount}:${orderId}:${PALLY_SECRET_KEY}`;
      const calculatedSignature = crypto.createHash('md5').update(signString).digest('hex');
      
      if (calculatedSignature.toLowerCase() !== receivedSignature.toLowerCase()) {
        console.error('Webhook Error: Signature verification failed', {
          received: receivedSignature,
          calculated: calculatedSignature,
          signString
        });
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    } else {
      console.error('Webhook Error: Missing signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // 2. Check if orderId is missing (e.g. test webhook from Paypalych)
    if (!orderId) {
      console.log('Webhook Info: Webhook signature is valid, but order_id is empty. This is likely a test/ping request.');
      return NextResponse.json({ message: 'Ping success' }, { status: 200 });
    }

    // Если статус означает успех. Paypalych обычно передает status 'success' или просто вызывает postback только при успехе.
    // Если статус существует и он не равен success/completed/paid, то игнорируем
    if (status && !['success', 'paid', 'completed', 'SUCCESS'].includes(status)) {
      return NextResponse.json({ message: 'Ignored non-success status' }, { status: 200 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: String(orderId) },
      include: { user: true }
    });

    if (!transaction) {
      console.error('Webhook Error: Transaction not found', orderId);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'COMPLETED') {
      return NextResponse.json({ message: 'Already processed' }, { status: 200 });
    }

    // Обновляем статус транзакции и начисляем баланс
    // Выполняем это в транзакции базы данных (SQL transaction), чтобы избежать race conditions
    await prisma.$transaction(async (tx) => {
      // 1. Помечаем транзакцию как успешную
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' }
      });

      // 2. Начисляем средства пользователю
      await tx.user.update({
        where: { id: transaction.userId },
        data: { balance: { increment: transaction.amount } }
      });
    });

    console.log(`Balance topped up: ${transaction.amount} for user ${transaction.userId}`);

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error: any) {
    console.error('Pally webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
