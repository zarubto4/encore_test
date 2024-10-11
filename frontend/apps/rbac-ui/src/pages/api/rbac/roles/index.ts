import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';
import { Api, SecurityData, PaginatedRolesResponse, RolesCreateRequest } from '@vpcs/rbac-client';
import UsersApiClient from '@vpcs/users-client';

const fetchAllRolePages = async (api: Api<SecurityData>, query: Partial<{ [key: string]: string | string[] }>) => {
  let page = 1;
  const pageSize = query.pageSize ? parseInt(query.pageSize as string, 10) : 20;
  const categories =
    (query.categories && (Array.isArray(query.categories) ? query.categories : [query.categories])) || undefined;
  const permissions =
    (query.permissions && (Array.isArray(query.permissions) ? query.permissions : [query.permissions])) || undefined;
  let allItems: PaginatedRolesResponse['items'] = [];
  let totalNumberOfElements = 0;

  do {
    const { data } = await api.v2.rolesList({
      ...query,
      page,
      size: pageSize,
      roleName: query.search as string,
      categoryIds: categories?.join(','),
      permissionIds: permissions?.join(','),
      sort: 'name,asc',
    });

    totalNumberOfElements = data.totalNumberOfElements;
    allItems = allItems.concat(data.items);
    page++;
  } while (allItems.length < totalNumberOfElements);

  return allItems;
};

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  try {
    if (req.method === 'GET') {
      const noPagination = req.query.noPagination === 'true';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20;

      let items = [];
      let totalNumberOfElements = 0;

      if (noPagination) {
        items = await fetchAllRolePages(rbac.api, req.query);
        totalNumberOfElements = items.length;
      } else {
        const categories =
          (req.query.categories &&
            (Array.isArray(req.query.categories) ? req.query.categories : [req.query.categories])) ||
          undefined;
        const permissions =
          (req.query.permissions &&
            (Array.isArray(req.query.permissions) ? req.query.permissions : [req.query.permissions])) ||
          undefined;
        const { data } = await rbac.api.v2.rolesList({
          ...req.query,
          page,
          size: pageSize,
          roleName: req.query.search as string,
          categoryIds: categories?.join(','),
          permissionIds: permissions?.join(','),
          sort: 'name,asc',
        });

        items = data.items;
        totalNumberOfElements = data.totalNumberOfElements;
      }

      const userApiClient = new UsersApiClient({ xRequestId: req.headers['x-request-id'] as string });
      const resolvedUsers = await userApiClient.resolveUsersUids(items.map((role) => ({ userId: role.createdBy })));
      const rolesWithUsers = items.map((role) => ({
        ...role,
        createdByUser: resolvedUsers[role.createdBy],
      }));

      return res.status(200).json({
        items: rolesWithUsers,
        total: totalNumberOfElements,
        page: noPagination ? 1 : page,
        pageSize: noPagination ? totalNumberOfElements : pageSize,
      });
    }

    if (req.method === 'PATCH') {
      const payload: { roles: string[]; permissions: string[] } = req.body;
      const { permissions, roles } = payload;
      const rolesPromises = roles.map((roleId) => {
        return rbac.api.v2.rolesPartialUpdate(roleId, { permissions, categories: [] });
      });
      const result = await Promise.all(rolesPromises);
      res.status(200).json(result);
      return;
    }

    if (req.method === 'POST') {
      const payload: RolesCreateRequest = req.body;
      const { data } = await rbac.api.v2.rolesCreate(payload);
      res.status(201).json(data);
      return;
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default withRbacApiClient(handler);
