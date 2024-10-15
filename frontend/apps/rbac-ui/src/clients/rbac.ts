import { RbacApiClient } from '@vpcs/rbac-client';
import { NextApiRequest, NextApiResponse } from 'next';
import { RBAC_USER_ID_HEADER } from '@/constants';
import { handleError } from '@/utils';

export type RbacApiClientHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  rbac: RbacApiClient,
) => Promise<void>;

export function withRbacApiClient(handler: RbacApiClientHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const userId = req.headers[RBAC_USER_ID_HEADER] as string | undefined;
    const xRequestId = req.headers['x-request-id'] as string;

    if (!userId) {
      res.status(400).json({ message: `${RBAC_USER_ID_HEADER} header is required` });
      return;
    }
    try {
      await handler(req, res, new RbacApiClient({ xRequestId,userId }));
    } catch (error) {
      console.error(`Error in RbacApiClient: ${handleError(error)}`);
    }
  };
}
