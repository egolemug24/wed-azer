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

    const orderId = data.order_id || data.InvId;
    const status = data.status || data.Status;
    const amount = data.amount || data.OutSum;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
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
