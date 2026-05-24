import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';

async function verifyAdmin() {
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (user?.role === 'ADMIN') return user;
    return null;
  } catch {
    return null;
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, name, color, glow, price1, price3, price12, features, popular } = body;

    if (!id) return NextResponse.json({ error: 'Missing plan ID' }, { status: 400 });

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name,
        color,
        glow,
        price1,
        price3,
        price12,
        features,
        popular
      }
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, color, glow, price1, price3, price12, features, popular, order } = body;

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        color,
        glow,
        price1,
        price3,
        price12,
        features,
        popular: popular || false,
        order: order || 0
      }
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
