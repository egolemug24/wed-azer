import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('session_id')?.value;
    
    // Create new session if doesn't exist
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      // Use next/headers cookies API to set it.
      // Wait, in Route Handlers we can set cookies in the response object
      // Let's do it in the response below
    }

    // Upsert the visitor in the database
    await prisma.siteVisitor.upsert({
      where: { sessionId },
      update: { lastSeen: new Date() },
      create: { sessionId, lastSeen: new Date() }
    });

    const response = NextResponse.json({ success: true });
    
    // If it was a new session, set the cookie in the response
    if (!cookieStore.has('session_id')) {
      response.cookies.set({
        name: 'session_id',
        value: sessionId,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 365 // 1 year
      });
    }

    return response;
  } catch (error) {
    console.error('Analytics ping error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
