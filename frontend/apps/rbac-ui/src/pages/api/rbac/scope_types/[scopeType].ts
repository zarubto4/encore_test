import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';
import UsersApiClient from 'libs/users-client/src';

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  const scopeType = req.query.scopeType as string;
  if (!scopeType) {
    res.status(400).json({ message: 'Scope Type is required' });
    return;
  }

  if (req.method === 'GET') {
    const { data } = await rbac.api.v2.scopeTypesDetail(scopeType);
    const userApiClient = new UsersApiClient({ xRequestId: req.headers['x-request-id'] as string });
    const resolvedUsers = await userApiClient.resolveUsersUids([{ userId: data.createdBy }]);
    const user = {
      ...data,
      createdByUser: resolvedUsers[data.createdBy],
    };
    res.status(200).json(user);
  }

  if (req.method === 'PATCH') {
    const payload = req.body;
    const { data } = await rbac.api.v2.scopeTypesPartialUpdate(scopeType, payload);
    res.status(200).json(data);
    return;
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};

export default withRbacApiClient(handler);
