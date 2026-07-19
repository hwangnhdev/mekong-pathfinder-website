import { NextResponse } from 'next/server';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'mekong2026';
const TOKEN_SECRET = 'mp-admin-token-2026';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, username, password, token } = body;

    if (action === 'login') {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        // Simple token: base64 of secret + timestamp
        const adminToken = Buffer.from(`${TOKEN_SECRET}:${Date.now()}`).toString('base64');
        return NextResponse.json({ success: true, token: adminToken });
      }
      return NextResponse.json({ success: false, error: 'Sai tên đăng nhập hoặc mật khẩu.' });
    }

    if (action === 'verify') {
      if (token && isValidToken(token)) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: 'Phiên đăng nhập không hợp lệ.' });
    }

    return NextResponse.json({ success: false, error: 'Hành động không hợp lệ.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function isValidToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    if (!decoded.startsWith(TOKEN_SECRET + ':')) return false;
    const timestamp = parseInt(decoded.split(':')[1], 10);
    // Token valid for 24 hours
    return Date.now() - timestamp < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}
