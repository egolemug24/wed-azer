import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, name, description, price, discount, image, categoryId, region, isAvailable, platforms } = body;

    if (!id) return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        discount,
        image,
        categoryId,
        region,
        isAvailable,
        platform: platforms
      }
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, description, price, discount, image, categoryId, region, isAvailable, platforms } = body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        discount: discount || 0,
        image,
        categoryId,
        region,
        isAvailable: isAvailable ?? true,
        platform: platforms || ['PS5']
      }
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
