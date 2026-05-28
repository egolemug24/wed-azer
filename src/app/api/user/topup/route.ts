import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Method Not Allowed. This test endpoint is disabled.' }, { status: 405 });
}
