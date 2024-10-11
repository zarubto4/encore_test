import UsersApiClient, { USER_REGION } from '@vpcs/users-client';
import { crit } from '@/lib/Logger/server';
import { handleError } from '@/utils';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { AccountSuccessResponse } from '@vpcs/users-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userUid } = req.query;
  const { show } = req.query;
  if (!userUid) {
    return crit({ req, res, error: 'userUid is required', status: 400 });
  }

  const userUidString = userUid as string;

  try {
    const userApiClient = new UsersApiClient({ xRequestId: req.headers['x-request-id'] as string });
    // try get user by uid in NA and EMEA
    let resolvedUser = await userApiClient.getUserById(userUidString, USER_REGION.NA);
    if (resolvedUser.length === 0) {
      resolvedUser = await userApiClient.getUserById(userUidString, USER_REGION.EMEA);
      if (resolvedUser.length === 0) {
        return crit({ req, res, error: `User with ID ${userUidString} not found in any region`, status: 404 });
      }
    }

    const [user] = resolvedUser as AccountSuccessResponse[];

    if (show === 'full') {
      return res.status(200).json(user);
    }

    return res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error: unknown) {
    return crit({ req, res, error: handleError(error) });
  }
}
