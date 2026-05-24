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

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Online now (active in the last 5 minutes)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
    const onlineCount = await prisma.siteVisitor.count({
      where: { lastSeen: { gte: fiveMinutesAgo } }
    });

    // Visits
    const visitorsDay = await prisma.siteVisitor.count({ where: { createdAt: { gte: startOfDay } } });
    const visitorsWeek = await prisma.siteVisitor.count({ where: { createdAt: { gte: startOfWeek } } });
    const visitorsMonth = await prisma.siteVisitor.count({ where: { createdAt: { gte: startOfMonth } } });

    // Orders (Completed)
    const ordersDay = await prisma.order.findMany({ where: { status: 'COMPLETED', createdAt: { gte: startOfDay } } });
    const ordersWeek = await prisma.order.findMany({ where: { status: 'COMPLETED', createdAt: { gte: startOfWeek } } });
    const ordersMonth = await prisma.order.findMany({ where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } } });

    const salesDay = ordersDay.reduce((sum, order) => sum + 1, 0); // items or orders? let's use orders
    const salesWeek = ordersWeek.reduce((sum, order) => sum + 1, 0);
    const salesMonth = ordersMonth.reduce((sum, order) => sum + 1, 0);

    const revenueDay = ordersDay.reduce((sum, order) => sum + order.total, 0);
    const revenueWeek = ordersWeek.reduce((sum, order) => sum + order.total, 0);
    const revenueMonth = ordersMonth.reduce((sum, order) => sum + order.total, 0);

    return NextResponse.json({
      onlineCount,
      visitors: { day: visitorsDay, week: visitorsWeek, month: visitorsMonth },
      sales: { day: salesDay, week: salesWeek, month: salesMonth },
      revenue: { day: revenueDay, week: revenueWeek, month: revenueMonth }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
