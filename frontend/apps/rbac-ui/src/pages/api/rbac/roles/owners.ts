import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';
import UsersApiClient, { UserRegionType } from '@vpcs/users-client';

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  const roleId = req.query.roleId as string;
  const ownerId = req.query.ownerId as string;
  if (!roleId && !ownerId) {
    res.status(400).json({ message: 'RoleId or OwnerId is required' });
    return;
  }

  if (req.method === 'GET') {
    const { data } = await rbac.api.v2.rolesOwnersList({ roleIds: roleId, ownerIds: ownerId });
    const userApiClient = new UsersApiClient({ xRequestId: req.headers['x-request-id'] as string });
    const resolvedUsers = await userApiClient.resolveUsersUids(data.map((r) => ({ userId: r.ownerId, region: r.region as UserRegionType })));
    const roles = data.map((role) => ({
      ...role,
      ownerUser: resolvedUsers[role.ownerId],
    }));
    res.status(200).json(roles);
  }

  if (req.method === 'DELETE') {
    const ownerId = req.query.ownerId as string;
    if (!ownerId) {
      res.status(400).json({ message: 'Owner ID is required' });
      return;
    }
    const roleId = req.query.roleId as string;
    await rbac.api.v2.rolesOwnersDelete(roleId, ownerId);
    res.status(204).end();
    return;
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};

export default withRbacApiClient(handler);
