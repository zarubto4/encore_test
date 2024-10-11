import UsersApiClient from '@vpcs/users-client';
import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';

const handler: RbacApiClientHandler = async (req, res, rbac) => {

  const userApiClient = new UsersApiClient({ xRequestId: req.headers['x-request-id'] as string });

  if (req.method === 'POST') {
    const { name, description } = req.body;
    const { data } = await rbac.api.v2.categoriesCreate({ name, description });
    res.status(201).json(data);
    return;
  }

  if (req.method === 'PATCH') {
    const { categoryId, permissions = [], roles = [] } = req.body;
    if (permissions.length > 0) {
      permissions.forEach(async (permissionId: string) => {
        await rbac.api.v2.permissionsPartialUpdate(permissionId, { categories: [categoryId] });
      });
    }
    if (roles.length > 0) {
      roles.forEach(async (roleId: string) => {
        await rbac.api.v2.rolesPartialUpdate(roleId, { categories: [categoryId] });
      });
    }
    res.status(200).json({ categoryId, permissions, roles });
  }

  if (req.method === 'GET') {
    const { data } = await rbac.api.v2.categoriesList();
    const resolvedUsers = await userApiClient.resolveUsersUids(data.map((c) => ({ userId: c.createdBy })));
    const categoriesWithUsers = data.map((category) => ({
      ...category,
      createdByUser: resolvedUsers[category.createdBy],
    }));
    return res.status(200).json(categoriesWithUsers);
  }
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};

export default withRbacApiClient(handler);
