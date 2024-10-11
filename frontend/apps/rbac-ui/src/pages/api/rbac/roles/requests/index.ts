import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';
import UsersApiClient, { UserRegionType, UserType } from '@vpcs/users-client';
import { NextApiRequestQuery } from 'next/dist/server/api-utils';
import { crit } from '@/lib/Logger/server';
import { resolveMyUserIdForRegion } from '@/lib/user';

import type { PaginatedUserRoleRequestsResponse, PaginatedRolesResponse, Api, ScopeType } from '@vpcs/rbac-client';

type RoleRequestWithUsers = {
  roleId: string;
  requesterId: string | null;
  approverId: string | null;
  requestedBy: { firstName: string | null; lastName: string | null };
  approvedBy: { firstName: string | null; lastName: string | null };
};

type MappedResultItem = {
  roleId: string;
  requesterId: string | null;
  approverId: string | null;
  region: UserRegionType;
};

const getRolesAndRequests = async (
  api: Api<{ headers?: { userId?: string } }>,
  query: NextApiRequestQuery,
  page: number,
  pageSize: number,
) => {
  const [{ data: rolesRequestList }, { data: rolesList }] = await Promise.all([
    api.v2.rolesRequestsList({ ...query, page, size: pageSize }),
    api.v2.rolesList({ ...query, page: 0, size: 100 }),
  ]);

  return { rolesRequestList, rolesList };
};

const mapRolesWithRequests = (
  rolesRequestList: PaginatedUserRoleRequestsResponse,
  rolesList: PaginatedRolesResponse,
): MappedResultItem[] => {
  return rolesRequestList.items.map((req) => {
    const currentRole = rolesList.items.find((role) => role.id === req.roleId);
    return { ...currentRole, ...req } as MappedResultItem;
  });
};

const getUserIdsWithRegions = (mappedResult: MappedResultItem[]) => {
  return mappedResult.reduce((ids, roleReq) => {
    if (roleReq.requesterId) ids.push({ userId: roleReq.requesterId, region: roleReq.region as UserRegionType });
    if (roleReq.approverId) ids.push({ userId: roleReq.approverId, region: roleReq.region as UserRegionType });
    return ids;
  }, [] as { userId: string; region: UserRegionType }[]);
};

const resolveUsers = async (userIdsWithRegions: { userId: string; region: UserRegionType }[], userApiClient: UsersApiClient) => {
  return userIdsWithRegions.length ? await userApiClient.resolveUsersUids(userIdsWithRegions) : {};
};

const mapRolesWithUsers = (
  mappedResult: MappedResultItem[],
  resolvedUsers: { [key: string]: UserType },
): RoleRequestWithUsers[] => {
  return mappedResult.map((roleReq) => ({
    ...roleReq,
    requestedBy: roleReq.requesterId ? resolvedUsers[roleReq.requesterId] : { firstName: null, lastName: null },
    approvedBy: roleReq.approverId ? resolvedUsers[roleReq.approverId] : { firstName: null, lastName: null },
  }));
};

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  if (req.method === 'GET') {
    const userApiClient = new UsersApiClient({ xRequestId: req.headers['x-request-id'] as string });
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20;
    const { rolesRequestList, rolesList } = await getRolesAndRequests(rbac.api, req.query, page, pageSize);
    const mappedResult = mapRolesWithRequests(rolesRequestList, rolesList);
    const userIdsWithRegions = getUserIdsWithRegions(mappedResult);
    const resolvedUsers = await resolveUsers(userIdsWithRegions, userApiClient);
    const rolesWithUsers = mapRolesWithUsers(mappedResult, resolvedUsers);
    const { totalNumberOfElements } = rolesRequestList;

    return res.status(200).json({
      items: rolesWithUsers,
      total: totalNumberOfElements,
      page,
      pageSize,
    });
  }

  if (req.method === 'POST') {
    const {
      roleId,
      scopeType = 'GLOBAL',
      scopeValue = '',
      comment = '',
      regions = undefined,
    } = req.body as {
      roleId: string;
      scopeType: ScopeType;
      scopeValue: string;
      comment: string;
      regions: UserRegionType[];
    };

    if (!roleId || !scopeType || !regions) {
      return crit({ req, res, error: 'roleId, scopeType, and regions are required', status: 400 });
    }

    const requestsPerRegion = await Promise.all(
      regions.map(async (region) => {
        rbac.setUserId(resolveMyUserIdForRegion(req, region));
        const { data } = await rbac.api.v2.rolesRequestsCreate({
          roleId,
          scopeType,
          scopeValue,
          comment,
          region,
        });
        return data;
      }),
    );

    return res.status(201).json(requestsPerRegion);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};

export default withRbacApiClient(handler);
