import { NextResponse } from 'next/server';

// Mock endpoint to silence 404 logs from client browser tracking extensions
export async function GET() {
  return new NextResponse(null, { status: 200 });
}
