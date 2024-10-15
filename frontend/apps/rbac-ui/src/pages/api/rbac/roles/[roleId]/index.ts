import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';
import { RBAC_USER_ID_HEADER } from '@/constants';
import { PermissionFactory } from '@/lib/Permission';
import { RolesPatchRequest } from '@vpcs/rbac-client';
import UsersApiClient from '@vpcs/users-client';

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  const roleId = req.query.roleId as string;
  const userId = req.headers[RBAC_USER_ID_HEADER] as string | undefined;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  if (!roleId) {
    res.status(400).json({ message: 'Role ID is required' });
    return;
  }

  if (req.method === 'PATCH') {
    const payload: RolesPatchRequest & { categoriesToBeRemoved: string[] } = req.body;
    const { categoriesToBeRemoved, ...updatePayload } = payload;

    // unfortunately, the API does not support removing categories in the same request
    if (categoriesToBeRemoved && categoriesToBeRemoved.length > 0) {
      await Promise.all(categoriesToBeRemoved.map((categoryId) => rbac.api.v2.rolesCategoriesDelete(roleId, categoryId)));
    }

    const { data } = await rbac.api.v2.rolesPartialUpdate(roleId, updatePayload);

    // clear cache for the user
    await PermissionFactory.clearCache(userId);

    res.status(200).json(data);
    return;
  }

  if (req.method === 'DELETE') {
    await rbac.api.v2.rolesDelete(roleId);
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    const { data } = await rbac.api.v2.rolesDetail(roleId);
    const { permissions } = data;
    const userIds = [data.createdBy];
    if (permissions?.length) {
      userIds.push(...new Set(permissions.map((permission) => permission.createdBy)));
    }
    const userApiClient = new UsersApiClient({ xRequestId: req.headers['x-request-id'] as string });
    const resolvedUsers = await userApiClient.resolveUsersUids(userIds.map((userId) => ({ userId })));
    const user = {
      ...data,
      createdByUser: resolvedUsers[data.createdBy],
      permissions: data.permissions?.map((permission) => ({
        ...permission,
        createdByUser: resolvedUsers[permission.createdBy],
      }))
    };
    res.status(200).json(user);
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};

export default withRbacApiClient(handler);
