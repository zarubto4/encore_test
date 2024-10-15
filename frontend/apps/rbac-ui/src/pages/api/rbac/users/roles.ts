import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';
import { Api, RbacApiClient, ScopeType, SecurityData } from '@vpcs/rbac-client';
import { handleError } from '@/utils';
import UsersApiClient, { type UserRegionType } from '@vpcs/users-client';
import { crit } from '@/lib/Logger/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { resolveMyUserIdForRegion, resolveUserByEmailForRegion } from '@/lib/user';
import { resolveRoleIds } from '@/lib/roles';

const handleGetRequest = async (req: NextApiRequest, res: NextApiResponse, api: Api<SecurityData>) => {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;

  const { data } = await api.v2.usersRolesList({
    ...req.query,
    page,
    size: pageSize,
  });

  const { totalNumberOfElements } = data;
  const userApiClient = new UsersApiClient({ xRequestId: req.headers['x-request-id'] as string });
  const users = await userApiClient.resolveUsersUids(data.items.map((r) => ({ userId: r.userId, region: r.region as UserRegionType })));
  const roles = await resolveRoleIds(
    data.items.map((r) => r.roleId),
    api,
  );

  const dataWithUsers = data.items.map((role) => ({
    ...role,
    user: users[role.userId],
    role: roles[role.roleId],
  }));

  res.status(200).json({
    items: dataWithUsers,
    total: totalNumberOfElements,
    page,
    pageSize,
  });
};

const handlePostRequest = async (req: NextApiRequest, res: NextApiResponse, rbac: RbacApiClient) => {
  const {
    roles,
    emails,
    scopeType = 'GLOBAL',
    scopeValue = '',
    comments = '',
    regions = undefined,
  } = req.body as {
    roles: string[];
    emails: string[];
    scopeType: ScopeType;
    scopeValue: string;
    comments: string;
    regions: UserRegionType[];
  };

  const api = rbac.api;

  if (!roles.length || !emails.length || !scopeType || !regions) {
    return crit({ req, res, error: 'Invalid request', status: 400 });
  }

  const usersPerRegion = await Promise.all(
    regions.map(async (region) => {
      return await Promise.all(
        emails.map(async (email) => {
          try {
            return {
              email,
              ...(await resolveUserByEmailForRegion(email, region, req)),
            };
          } catch (error) {
            return { email, region, user: null, error: handleError(error) };
          }
        }),
      );
    }),
  );

  const allUsers = usersPerRegion.flat();
  const result = allUsers.reduce(
    (acc, { email, user, region }) => {
      if (!user) {
        acc.failed.push({ email, region: region as UserRegionType, error: 'User not found' });
      } else {
        acc.success.push({ email, userId: user.id, region: region as UserRegionType });
      }
      return acc;
    },
    { success: [], failed: [] } as {
      success: { email: string; userId: string; region: UserRegionType }[];
      failed: { email: string; region: UserRegionType; error: string }[];
    },
  );
  if (!result.success.length) {
    return crit({ req, res, error: 'No users found', status: 404 });
  }

  const finalResult = { success: [], failed: [...result.failed] } as {
    success: { email: string; userId: string; region: UserRegionType }[];
    failed: { email: string; region: UserRegionType; error: string }[];
  };

  await Promise.all(
    result.success.map(async ({ userId, email, region }) => {
      try {
        rbac.setUserId(resolveMyUserIdForRegion(req, region));
        await api.v2.usersRolesCreate(
          userId,
          roles.map((roleId) => ({
            roleId,
            scopeType,
            scopeValue,
            comments,
            region,
          })),
        );
        finalResult.success.push({ email, userId, region });
      } catch (error) {
        crit({ req, error: handleError(error), status: 500 });
        finalResult.failed.push({ email, region, error: handleError(error) });
      }
    }),
  );
  
  res.status(200).json(finalResult);
  
};

const handleDeleteRequest = async (req: NextApiRequest, res: NextApiResponse, api: Api<SecurityData>) => {
  const { roleId, userId, scopeType, scopeValue } = req.body as {
    roleId: string;
    userId: string;
    scopeType: ScopeType;
    scopeValue: string;
  };

  await api.v2.usersRolesDelete2(roleId, userId, scopeType, { scopeValue });
  res.status(204).end();
};

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  switch (req.method) {
    case 'GET':
      await handleGetRequest(req, res, rbac.api);
      break;
    case 'POST':
      await handlePostRequest(req, res, rbac);
      break;
    case 'DELETE':
      await handleDeleteRequest(req, res, rbac.api);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
      break;
  }
};

export default withRbacApiClient(handler);
