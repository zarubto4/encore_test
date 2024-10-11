import { NextRequest, NextResponse } from 'next/server';
import { RBAC_USER_ID_HEADER, RBAC_TOKEN_COOKIE, RBAC_USER_ID_NA, RBAC_USER_ID_EMEA } from '@/constants';
import { verifyToken } from '@/lib/auth';

const redirectToLoginPage = (req: NextRequest) => {
  const returnPath = req.nextUrl.pathname;
  const targetUrl = new URL('/login', req.url);
  targetUrl.searchParams.set('returnPath', returnPath);
  return NextResponse.redirect(targetUrl);
};

export async function middleware(req: NextRequest) {

  // Skip user verification on /login
  if (req.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  const tokenCookie = req.cookies.get(RBAC_TOKEN_COOKIE) ?? null;
  if (!tokenCookie) {
    return redirectToLoginPage(req);
  }

  const token = tokenCookie.value;
  try {
    const userPayload = await verifyToken(token);
    const userNA = userPayload?.NA;
    const userEMEA = userPayload?.EMEA;
  
    const user = userNA || userEMEA;
    if (!user) {
      return redirectToLoginPage(req);
    }

    const headers = new Headers(req.headers);
    headers.set(RBAC_USER_ID_HEADER, user.id);
    if (userNA?.id) {
      headers.set(RBAC_USER_ID_NA, userNA.id);
    }
    if (userEMEA?.id) {
      headers.set(RBAC_USER_ID_EMEA, userEMEA.id);
    }
    
    const xRequestId = req.headers.get('x-request-id') || crypto.randomUUID();
    headers.set('X-Request-ID', xRequestId as string);

    const response = NextResponse.next({
      request: {
        ...req,
        headers,
      },
    });

    return response;

  } catch (error: unknown) {
    console.error(error);

    // Clear the RBAC_TOKEN_COOKIE cookie
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.headers.set('Set-Cookie', `${RBAC_TOKEN_COOKIE}=; Max-Age=0; Path=/`);
    return response;
  }
}

// Define the matcher to apply the middleware only to specific routes
export const config = {
  matcher: ['/', '/((?!api/login|error|api/headers|grpn/healthcheck|grpn/versions|images|_next/static|favicon.ico).*)'],
};
