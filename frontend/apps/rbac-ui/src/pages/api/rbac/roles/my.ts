import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';
import { RBAC_USER_ID_EMEA, RBAC_USER_ID_HEADER, RBAC_USER_ID_NA } from '@/constants';
import { resolveRoleIds } from '@/lib/roles';

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;

  const EMEA_USER_ID = req.headers[RBAC_USER_ID_EMEA] as string;
  const NA_USER_ID = req.headers[RBAC_USER_ID_NA] as string;
  const RBAC_USER_ID = req.headers[RBAC_USER_ID_HEADER] as string;

  const items = [];
  let totalNumberOfElements = 0;

  if (NA_USER_ID) {
    rbac.setUserId(NA_USER_ID);
    const { data } = await rbac.api.v2.usersRolesList({
      userIds: [NA_USER_ID],
      page,
      size: pageSize,
    });
    items.push(...data.items);
    totalNumberOfElements += data.totalNumberOfElements;
  }

  if (EMEA_USER_ID) {
    rbac.setUserId(EMEA_USER_ID);
    const { data } = await rbac.api.v2.usersRolesList({
      userIds: [EMEA_USER_ID],
      page,
      size: pageSize,
    });
    items.push(...data.items);
    totalNumberOfElements += data.totalNumberOfElements;
  }

  // set default user id
  rbac.setUserId(RBAC_USER_ID);
  
  const roles = await resolveRoleIds(
    items.map((r) => r.roleId),
    rbac.api,
  );

  const dataWithRoles = items.map((role) => ({
    ...role,
    role: roles[role.roleId],
  }));

  return res.status(200).json({
    items: dataWithRoles,
    total: totalNumberOfElements,
    page,
    pageSize,
  });
};

export default withRbacApiClient(handler);
