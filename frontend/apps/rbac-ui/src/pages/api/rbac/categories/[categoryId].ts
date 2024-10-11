import UsersApiClient from '@vpcs/users-client';
import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  const categoryId = req.query.categoryId as string;
  if (!categoryId) {
    res.status(400).json({ message: 'Category ID is required' });
    return;
  }

  const userApiClient = new UsersApiClient({ xRequestId: req.headers['x-request-id'] as string });

  if (req.method === 'PATCH') {
    const { data } = await rbac.api.v2.categoriesPartialUpdate(categoryId, req.body);
    res.status(200).json(data);
    return;
  }

  if (req.method === 'DELETE') {
    await rbac.api.v2.categoriesDelete(categoryId);
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    const { data } = await rbac.api.v2.categoriesDetail(categoryId);
    const resolvedUser = await userApiClient.resolveUsersUids([{ userId: data.createdBy }]);
    const categoryWithUser = {
      ...data,
      createdByUser: resolvedUser[data.createdBy],
    };
    res.status(200).json(categoryWithUser);
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};

export default withRbacApiClient(handler);
