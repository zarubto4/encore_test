import { validate as uuidValidate } from 'uuid';
import { Parser } from '@json2csv/plainjs';
import dayjs from 'dayjs';

import UsersApiClient, { UserRegionType, UserType } from '@vpcs/users-client';
import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';
import { Api, AuditResponse, SecurityData } from '@vpcs/rbac-client';
import { crit } from '@/lib/Logger/server';
import { handleError } from '@/utils';
import { resolveUserByEmailForRegion } from '@/lib/user';

type AuditResult = {
  user: UserType;
  date: string;
  userId: string;
  action: string;
  objectType: string;
  objectName: string;
  affectedObject?: string;
  affectedObjectUser?: UserType;
  region: string;
};

type Query = {
  roleId: string;
  permissionId: string;
  createdFrom: string;
  createdTo: string;
  userId: string | undefined;
  affectedUserId: string | undefined;
  type: string;
  region?: UserRegionType;
};

const CSV_FIELDS = [
  { label: 'User email', value: (record: AuditResult) => record.user?.email || '-' },
  { label: 'UserID', value: 'userId' },
  { label: 'Region', value: 'region' },
  { label: 'Action', value: 'action' },
  { label: 'Object', value: 'objectType' },
  { label: 'Object name', value: 'objectName' },
  { label: 'Affected object', value: 'affectedObject' },
  { label: 'Affected user email', value: (record: AuditResult) => record.affectedObjectUser?.email || '-' },
  { label: 'Date', value: 'date' },
];

const fetchAllPages = async (api: Api<SecurityData>, query: Query): Promise<AuditResponse[]> => {
  const size = 100;
  let page = 1;
  let allItems: AuditResponse[] = [];
  let totalNumberOfElements = 0;

  do {
    const { data } = await api.v2.auditList({ ...query, page, size });
    totalNumberOfElements = data.totalNumberOfElements;
    allItems = allItems.concat(data.items);
    page++;
  } while (allItems.length < totalNumberOfElements);

  return allItems;
};

const resolveUserIds = async (items: AuditResponse[], userApiClient: UsersApiClient): Promise<{ [key: string]: UserType }> => {
  if (!userApiClient) {
    throw new Error('User API client is not initialized');
  }
  const userIdRegionMap = new Map<string, string>();
  items.forEach((i) => {
    if (uuidValidate(i.userId)) {
      userIdRegionMap.set(i.userId, i.region);
    }
    if (i.affectedObject && uuidValidate(i.affectedObject)) {
      userIdRegionMap.set(i.affectedObject, i.region);
    }
  });

  return userApiClient.resolveUsersUids(
    Array.from(userIdRegionMap).map(([userId, region]) => ({ userId, region: region as UserRegionType }))
  );
};

const mapItemsWithUsers = (items: AuditResponse[], resolvedUsers: { [key: string]: UserType }): AuditResult[] => {
  return items.map((item) => ({
    ...item,
    user: resolvedUsers[item.userId],
    date: dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss'),
    ...(item.affectedObject && { affectedObjectUser: resolvedUsers[item.affectedObject] }),
  }));
};

const generateCSV = async (items: AuditResult[]): Promise<string> => {
  const parser = new Parser({ fields: CSV_FIELDS });
  return parser.parse(items);
};

const getAuditData = async (rbac: Api<SecurityData>, query: Query, download: boolean, page: number, pageSize: number, userApiClient: UsersApiClient) => {
  let items: AuditResponse[] = [];
  let totalNumberOfElements = 0;

  if (download) {
    items = await fetchAllPages(rbac, query);
    totalNumberOfElements = items.length;
  } else {
    const { data } = await rbac.v2.auditList({ ...query, page, size: pageSize });
    items = data.items;
    totalNumberOfElements = data.totalNumberOfElements;
  }

  const resolvedUsers = await resolveUserIds(items, userApiClient);
  return { items: mapItemsWithUsers(items, resolvedUsers), totalNumberOfElements };
};

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const userApiClient = new UsersApiClient({ xRequestId: req.headers['x-request-id'] as string });

  const { role, permission, dateFrom, dateTo, user, affectedUser, type, download, page, pageSize, region } = req.query;

  const query: Query = {
    roleId: role as string,
    permissionId: permission as string,
    createdFrom: dateFrom as string,
    createdTo: dateTo as string,
    userId: user ? (await resolveUserByEmailForRegion(user as string, region as UserRegionType, req))?.user?.id : undefined,
    affectedUserId: affectedUser ? (await resolveUserByEmailForRegion(affectedUser as string, region as UserRegionType, req))?.user?.id : undefined,
    type: type as string,
    region: region ? (region as UserRegionType) : undefined,
  };

  const isDownload = download === 'csv';
  const currentPage = page ? parseInt(page as string, 10) : 1;
  const currentPageSize = pageSize ? parseInt(pageSize as string, 10) : 20;

  try {
    const { items, totalNumberOfElements } = await getAuditData(rbac.api, query, isDownload, currentPage, currentPageSize, userApiClient);

    if (isDownload) {
      const csv = await generateCSV(items);
      const fileName = `audit-log-${type}-${region}-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.csv`; // Add region to file name
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'text/csv');
      return res.status(200).send(csv);
    }

    return res.status(200).json({
      items,
      total: totalNumberOfElements,
      page: currentPage,
      pageSize: currentPageSize,
    });
  } catch (error) {
    console.error(error);
    crit({ req, res, error: handleError(error) });
    return res.status(500).json({ message: 'Failed to process audit data' });
  }
};

export default withRbacApiClient(handler);
