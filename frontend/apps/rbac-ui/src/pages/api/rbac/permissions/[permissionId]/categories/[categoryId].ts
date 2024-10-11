import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  const permissionId = req.query.permissionId as string;
  const categoryId = req.query.categoryId as string;
  if (!permissionId) {
    res.status(400).json({ message: 'Permission ID is required' });
    return;
  }
  if (!categoryId) {
    res.status(400).json({ message: 'Category ID is required' });
    return;
  }

  if (req.method === 'DELETE') {
    await rbac.api.v2.permissionsCategoriesDelete(permissionId, categoryId);
    res.status(204).end();
    return;
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};

export default withRbacApiClient(handler);
