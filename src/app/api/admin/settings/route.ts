import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { rateUah, rateTry } = body;

    const settings = await prisma.settings.upsert({
      where: { id: 'global' },
      update: {
        ...(rateUah !== undefined && { rateUah: Number(rateUah) }),
        ...(rateTry !== undefined && { rateTry: Number(rateTry) })
      },
      create: {
        id: 'global',
        rateUah: rateUah !== undefined ? Number(rateUah) : 2.5,
        rateTry: rateTry !== undefined ? Number(rateTry) : 3.0
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
