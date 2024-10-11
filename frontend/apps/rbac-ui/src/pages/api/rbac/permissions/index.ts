import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';
import { Api, SecurityData, PaginatedPermissionsResponse } from 'libs/rbac-client/src';
import UsersApiClient from 'libs/users-client/src';

const fetchAllPages = async (api: Api<SecurityData>, query: Partial<{ [key: string]: string | string[] }>) => {
  let page = 1;
  const pageSize = query.pageSize ? parseInt(query.pageSize as string, 10) : 20;
  const categories =
    (query.categories && (Array.isArray(query.categories) ? query.categories : [query.categories])) || undefined;
  let allItems: PaginatedPermissionsResponse['items'] = [];
  let totalNumberOfElements = 0;

  do {
    const { data } = await api.v2.permissionsList({
      ...query,
      page,
      size: pageSize,
      permissionCode: query.search as string,
      categoryIds: categories?.join(','),
      sort: 'code,asc',
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
        items = await fetchAllPages(rbac.api, req.query);
        totalNumberOfElements = items.length;
      } else {
        const categories =
          (req.query.categories &&
            (Array.isArray(req.query.categories) ? req.query.categories : [req.query.categories])) ||
          undefined;
        const { data } = await rbac.api.v2.permissionsList({
          ...req.query,
          page,
          size: pageSize,
          permissionCode: req.query.search as string,
          categoryIds: categories?.join(','),
          sort: 'code,asc',
        });

        items = data.items;
        totalNumberOfElements = data.totalNumberOfElements;
      }

      const userApiClient = new UsersApiClient({ xRequestId: req.headers['x-request-id'] as string });
      const resolvedUsers = await userApiClient.resolveUsersUids(items.map((permission) => ({ userId: permission.createdBy })));
      const rolesWithUsers = items.map((permission) => ({
        ...permission,
        createdByUser: resolvedUsers[permission.createdBy],
      }));

      return res.status(200).json({
        items: rolesWithUsers,
        total: totalNumberOfElements,
        page: noPagination ? 1 : page,
        pageSize: noPagination ? totalNumberOfElements : pageSize,
      });
    }

    if (req.method === 'POST') {
      const { data } = await rbac.api.v2.permissionsCreate(req.body);
      return res.status(200).json(data);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default withRbacApiClient(handler);
