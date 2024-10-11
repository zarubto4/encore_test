import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  const { roleId, permissionId } = req.query;

  if (!roleId || Array.isArray(roleId)) {
    res.status(400).json({ message: 'Role ID is required and must be a single string' });
    return;
  }
  if (!permissionId || Array.isArray(permissionId)) {
    res.status(400).json({ message: 'Permission ID is required and must be a single string' });
    return;
  }
  if (req.method === 'DELETE') {
    await rbac.api.v2.rolesPermissionsDelete(roleId, permissionId);
    res.status(204).end();
    return;
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};

export default withRbacApiClient(handler);
