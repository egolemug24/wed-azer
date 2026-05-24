import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Wrap in a transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: sessionUser.id,
          amount: Number(amount),
          type: 'TOPUP',
          status: 'COMPLETED',
        }
      });

      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: sessionUser.id },
        data: { balance: { increment: Number(amount) } },
        select: { balance: true }
      });

      return { transaction, balance: updatedUser.balance };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Topup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
