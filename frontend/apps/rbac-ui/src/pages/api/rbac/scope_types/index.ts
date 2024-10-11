import UsersApiClient from 'libs/users-client/src';
import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  if (req.method === 'GET') {
    const { data } = await rbac.api.v2.scopeTypesList();
    const userApiClient = new UsersApiClient({ xRequestId: req.headers['x-request-id'] as string });
    const resolvedUsers = await userApiClient.resolveUsersUids(data.map((s) => ({ userId: s.createdBy })));
    const scopeTypesWithUsers = data.map((scopeType) => ({
      ...scopeType,
      createdByUser: resolvedUsers[scopeType.createdBy],
    }));
    return res.status(200).json(scopeTypesWithUsers);
  }

  if (req.method === 'POST') {
    const payload = req.body;
    const { data } = await rbac.api.v2.scopeTypesCreate(payload);
    return res.status(201).json(data);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};

export default withRbacApiClient(handler);
