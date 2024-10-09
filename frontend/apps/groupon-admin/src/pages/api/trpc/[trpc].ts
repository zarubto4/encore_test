import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/trpc';


export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: (opts) => createTRPCContext({ headers: new Headers(opts.req.headers as Record<string, string>) }),
});
