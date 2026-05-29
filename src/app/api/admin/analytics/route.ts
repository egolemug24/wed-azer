import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

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

    const salesDay = ordersDay.length;
    const salesWeek = ordersWeek.length;
    const salesMonth = ordersMonth.length;

    const revenueDay = ordersDay.reduce((sum, order) => sum + order.total, 0);
    const revenueWeek = ordersWeek.reduce((sum, order) => sum + order.total, 0);
    const revenueMonth = ordersMonth.reduce((sum, order) => sum + order.total, 0);

    // Total counts
    const totalUsers = await prisma.user.count();
    const totalOrdersCount = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: 'COMPLETED' }
    });
    const totalRevenueSum = totalRevenue._sum.total || 0;

    // Recent logins (15 users with recent login times)
    const recentLogins = await prisma.user.findMany({
      orderBy: { lastLogin: 'desc' },
      take: 15,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLogin: true,
        createdAt: true
      }
    });

    // Recent registrations
    const recentRegistrations = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Recent orders with details
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    // Recent transactions (top-ups and purchases)
    const recentTransactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      onlineCount,
      totalUsers,
      totalOrdersCount,
      totalRevenueSum,
      visitors: { day: visitorsDay, week: visitorsWeek, month: visitorsMonth },
      sales: { day: salesDay, week: salesWeek, month: salesMonth },
      revenue: { day: revenueDay, week: revenueWeek, month: revenueMonth },
      recentLogins,
      recentRegistrations,
      recentOrders,
      recentTransactions
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

