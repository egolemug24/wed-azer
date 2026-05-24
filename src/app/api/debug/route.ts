import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'undefined';
  return NextResponse.json({ dbUrl });
}
