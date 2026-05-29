import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, name, color, glow, price1, price3, price12, features, popular, region, type } = body;

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
        popular,
        region,
        type
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
    const { name, color, glow, price1, price3, price12, features, popular, order, region, type } = body;

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
        order: order || 0,
        region: region || "TR",
        type: type || "PS_PLUS"
      }
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
