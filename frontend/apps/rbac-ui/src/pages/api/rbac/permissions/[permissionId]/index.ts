import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';
import { PermissionsPatchRequest } from '@vpcs/rbac-client';

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  const permissionId = req.query.permissionId as string;
  if (!permissionId) {
    res.status(400).json({ message: 'Permission ID is required' });
    return;
  }

  if (req.method === 'PATCH') {
    const payload: PermissionsPatchRequest & { categoriesToBeRemoved: string[] } = req.body;
    const { categoriesToBeRemoved, ...updatePayload } = payload;

    // unfortunately, the API does not support removing categories in the same request
    if (categoriesToBeRemoved && categoriesToBeRemoved.length > 0) {
      await Promise.all(
        categoriesToBeRemoved.map((categoryId) => rbac.api.v2.permissionsCategoriesDelete(permissionId, categoryId)),
      );
    }

    const { data } = await rbac.api.v2.permissionsPartialUpdate(permissionId, updatePayload);
    res.status(200).json(data);
    return;
  }

  if (req.method === 'DELETE') {
    await rbac.api.v2.permissionsDelete(permissionId);
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    const { data } = await rbac.api.v2.permissionsDetail(permissionId);
    res.status(200).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};

export default withRbacApiClient(handler);
