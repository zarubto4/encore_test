import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  const roleId = req.query.roleId as string;
  const categoryId = req.query.categoryId as string;
  if (!roleId) {
    res.status(400).json({ message: 'Role ID is required' });
    return;
  }
  if (!categoryId) {
    res.status(400).json({ message: 'Category ID is required' });
    return;
  }

  if (req.method === 'DELETE') {
    await rbac.api.v2.rolesCategoriesDelete(roleId, categoryId);
    res.status(204).end();
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};

export default withRbacApiClient(handler);
