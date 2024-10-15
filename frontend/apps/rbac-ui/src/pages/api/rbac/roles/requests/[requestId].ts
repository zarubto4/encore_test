import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';
import { RBAC_USER_ID_HEADER } from '@/constants';
import { PermissionFactory } from '@/lib/Permission';
import { resolveMyUserIdForRegion } from '@/lib/user';
import { RoleRequestStatus } from '@vpcs/rbac-client';
import { UserRegionType } from '@vpcs/users-client';

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  const userId = req.headers[RBAC_USER_ID_HEADER] as string | undefined;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const requestId = req.query.requestId as string;
  if (!requestId) {
    res.status(400).json({ message: 'Request ID is required' });
    return;
  }

  const region = req.body.region as UserRegionType;
  if (!region) {
    res.status(400).json({ message: 'Region is required' });
    return;
  }

  if (req.method === 'PUT') {
    const { status, comment } = req.body as {
      status: RoleRequestStatus;
      comment: string;
    };

    rbac.setUserId(resolveMyUserIdForRegion(req, region));
    const { data } = await rbac.api.v2.rolesRequestsUpdate(requestId, { status, comment });

    // clear cache for all users
    await PermissionFactory.clearCache();

    return res.status(201).json(data);
  }

  res.setHeader('Allow', ['PUT']);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};

export default withRbacApiClient(handler);
