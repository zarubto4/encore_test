/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { AUTH_COOKIE_NAME, DOMAINS } from '@/constants';
import UsersApiClient from 'users-client';

const userApiClient = new UsersApiClient();

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  let email = opts.headers.get('x-grpn-email');
  let domain: string | undefined;

  if (!email) {
    const userCookie = parseCookie(opts.headers.get('cookie'))?.[AUTH_COOKIE_NAME];
    if (userCookie) {
      const { email: user_email = '', domain: user_domain = undefined } = JSON.parse(userCookie);
      if (user_email) {
        email = user_email;
        domain = user_domain;
      }
    }
  }

  if (!email) {
    throw new Error('User email not found in headers or cookie');
  }

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
    throw new Error('User not found');
  }
  return {
    ...opts,
    user,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend_ if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

const parseCookie = (str: string | null): Record<string, string> =>
  str
    ?.split(';')
    .map(v => v.split('='))
    .reduce((acc, v) => {
      return {
        ...acc,
        [decodeURIComponent(v[0]?.trim())]: decodeURIComponent(v[1]?.trim()),
      };
    }, {}) ?? {};
