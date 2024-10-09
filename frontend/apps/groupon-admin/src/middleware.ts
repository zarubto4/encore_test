import { NextRequest, NextResponse } from 'next/server';
import UsersApiClient from 'users-client';
import { AUTH_COOKIE_NAME, USER_ID_HEADER, USER_NAME_HEADER, DOMAINS } from './constants';

const userApiClient = new UsersApiClient();

export async function middleware(req: NextRequest) {
  const redirectToLogin = (returnPath: string) => {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('returnPath', returnPath);
    return NextResponse.redirect(loginUrl);
  };

  // Allow requests to /login
  if (req.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  const userCookie = req.cookies.get(AUTH_COOKIE_NAME);
  const { email: user_email = '', domain = undefined } = userCookie
    ? JSON.parse(userCookie.value)
    : {};
  const email = req.headers.get('x-grpn-email') || user_email;
  if (!email) {
    return redirectToLogin(req.nextUrl.pathname);
  }

  try {
    let user = await userApiClient.getUserFromEmail(email, domain);
    if (!user) {
      for (const domain of DOMAINS.slice(1)) {
        user = await userApiClient.getUserFromEmail(email, domain);
        if (user) {
          break;
        }
      }
    }
    if (!user) {
      return redirectToLogin(req.nextUrl.pathname);
    }

    // add user id to the request headers
    const headers = new Headers(req.headers);
    headers.set(USER_ID_HEADER, user.id);
    headers.set(USER_NAME_HEADER, `${user.firstName} ${user.lastName}`);
    return NextResponse.next({
      request: {
        ...req,
        headers,
      },
    });
  } catch (error: unknown) {
    console.error(error);
    return redirectToLogin(req.nextUrl.pathname);
  }
}

// Define the matcher to apply the middleware only to specific routes
export const config = {
  matcher: [
    '/',
    '/((?!api/login|grpn/healthcheck|grpn/versions|api/headers|api/trpc|images|_next/static|favicon.ico).*)',
  ],
};
