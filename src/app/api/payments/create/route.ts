import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount < 10) {
      return NextResponse.json({ error: 'Минимальная сумма пополнения 10 ₽' }, { status: 400 });
    }

    // Создаем транзакцию со статусом PENDING
    const transaction = await prisma.transaction.create({
      data: {
        userId: sessionUser.id,
        amount: Number(amount),
        type: 'TOPUP',
        status: 'PENDING'
      }
    });

    const PALLY_SHOP_ID = process.env.PALLY_SHOP_ID;
    const PALLY_SECRET_KEY = process.env.PALLY_SECRET_KEY;

    if (!PALLY_SHOP_ID || !PALLY_SECRET_KEY) {
      console.error("Missing Pally config in env");
      return NextResponse.json({ error: 'Платежный шлюз не настроен' }, { status: 500 });
    }

    // Подготовка данных для Pally API
    const formData = new URLSearchParams();
    formData.append('amount', amount.toString());
    formData.append('order_id', transaction.id);
    formData.append('description', 'Пополнение баланса GamerPlus');
    formData.append('type', 'normal');
    formData.append('shop_id', PALLY_SHOP_ID);
    formData.append('currency_in', 'RUB');

    // Делаем запрос к API кассы
    // Документация может использовать разные домены, используем pal24.pro или pally.info
    const response = await fetch('https://pal24.pro/api/v1/bill/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PALLY_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pally API Error:", errorText);
      return NextResponse.json({ error: 'Ошибка на стороне кассы' }, { status: 500 });
    }

    const data = await response.json();
    
    // Получаем ссылку на оплату
    const linkUrl = data?.link_page_url || data?.link_url || data?.url;

    if (!linkUrl) {
      console.error("Pally missing link:", data);
      return NextResponse.json({ error: 'Касса не вернула ссылку на оплату' }, { status: 500 });
    }

    // Возвращаем ссылку фронтенду для редиректа
    return NextResponse.json({ url: linkUrl });

  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
