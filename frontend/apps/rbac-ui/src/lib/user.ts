import UsersApiClient, { USER_REGION, type UserRegionType } from '@vpcs/users-client';
import { RBAC_USER_ID_EMEA, RBAC_USER_ID_NA, USERS_DOMAINS, USER_REGION_SELECT } from '@/constants';
import { NextApiRequest } from 'next';
import { IncomingMessage } from 'http';

type HandlerParams = {
  email: string;
  domain?: string;
  region?: UserRegionType;
  req: NextApiRequest | IncomingMessage;
};

async function handler({ email, domain, region, req }: HandlerParams) {
  if (!email) {
    throw new Error('Email is required');
  }

  const xRequestId =
    (req.headers?.['x-request-id'] as string) ||
    (req.headers instanceof Headers ? req.headers.get('x-request-id') : undefined) ||
    undefined;

  const userApiClient = new UsersApiClient({ xRequestId });

  if (domain && region) {
    const user = await userApiClient.getUserFromEmail(email, domain, region);
    return user ? { user, domain, region } : null;
  }

  if (!domain && region) {
    for (const _domain of USERS_DOMAINS[region].slice(0)) {
      const domain = _domain === 'internal' ? `internal.${region.toLowerCase()}` : _domain;
      const user = await userApiClient.getUserFromEmail(email, domain, region);
      if (user) {
        return { user, domain, region };
      }
    }
    return null;
  }

  for (const region of USER_REGION_SELECT) {
    for (const _domain of USERS_DOMAINS[region].slice(0)) {
      const domain = _domain === 'internal' ? `internal.${region.toLowerCase()}` : _domain;
      const user = await userApiClient.getUserFromEmail(email, domain, region);
      if (user) {
        return { user, domain, region };
      }
    }
  }
  return null;
}

export const resolveUserByEmailForRegion = async (
  email: string,
  region: UserRegionType,
  req: NextApiRequest | IncomingMessage,
) => {
  return handler({ email, region, req });
};

export const resolveMyUserIdForRegion = (req: NextApiRequest, region: UserRegionType): string => {
  const userIdHeader = region === USER_REGION.NA ? RBAC_USER_ID_NA : RBAC_USER_ID_EMEA;
  const userId = req.headers[userIdHeader];

  if (!userId) {
    throw new Error(`Cannot continue, because you do not have userId for ${region}!`);
  }

  return userId as string;
};
