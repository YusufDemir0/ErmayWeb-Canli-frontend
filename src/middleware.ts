import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const rawJwtSecret = process.env.JWT_SECRET;
if (!rawJwtSecret && process.env.NODE_ENV === 'production') {
  console.error('[SECURITY FATAL] JWT_SECRET is missing from environment variables!');
}

const secretKey = rawJwtSecret ? new TextEncoder().encode(rawJwtSecret) : null;

/**
 * Edge-compatible Cryptographic JWT Verification using 'jose'
 */
async function verifyAdminJwt(token?: string): Promise<{ valid: boolean; role?: string }> {
  if (!token || typeof token !== 'string' || !secretKey) return { valid: false };

  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      valid: true,
      role: payload.role as string | undefined,
    };
  } catch (err) {
    return { valid: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Portal (/admin and sub-routes)
  if (pathname.startsWith('/admin')) {
    const token =
      request.cookies.get('admin_jwt_token')?.value ||
      request.cookies.get('auth_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    const { valid, role } = await verifyAdminJwt(token);

    // If accessing admin sub-routes without an authentic, cryptographically verified ADMIN JWT, redirect to login
    if ((!valid || role !== 'ADMIN') && pathname !== '/admin') {
      const loginUrl = new URL('/admin', request.url);
      loginUrl.searchParams.set('unauthorized', '1');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
