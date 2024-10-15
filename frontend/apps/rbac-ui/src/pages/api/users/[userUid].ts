import UsersApiClient, { USER_REGION } from '@vpcs/users-client';
import { handleError } from '@/utils';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { AccountSuccessResponse } from '@vpcs/users-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userUid } = req.query;
  const { show } = req.query;
  if (!userUid) {
    return res.status(400).json({ message: 'userUid is required' });
  }

  const userUidString = userUid as string;

  try {
    const userApiClient = new UsersApiClient({ xRequestId: req.headers['x-request-id'] as string });
    // try get user by uid in NA and EMEA
    let resolvedUser = await userApiClient.getUserById(userUidString, USER_REGION.NA);
    if (resolvedUser.length === 0) {
      resolvedUser = await userApiClient.getUserById(userUidString, USER_REGION.EMEA);
      if (resolvedUser.length === 0) {
        return res.status(404).json({ message: `User with ID ${userUidString} not found in any region` });
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
    console.error(`Error in users/[userUid]: ${handleError(error)}`);
    return res.status(500).json({ message: handleError(error) });
  }
}
