import { useEffect, useState } from 'react';
import { NextRouter, useRouter } from 'next/router';
import { NextPage } from 'next';
import {
  Button,
  Flex,
  Typography,
  Alert,
  Form,
  DatePicker,
  TableProps,
  Space,
  Radio,
  RadioChangeEvent,
  Checkbox,
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';

import { handleError } from '@/utils';
import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';
import { useAccount } from '@/contexts/AccountContext';
import Head from '@/components/Head';
import ResponsiveTable from '@/components/ResponsiveTable';
import useFetchAuditLog from '@/hooks/useFetchAuditLog';
import useFetchRolesForOwner from '@/hooks/useFetchRolesForOwner';
import SelectRoles from '@/components/SelectRoles';
import SelectPermissions from '@/components/SelectPermissions';
import User from '@/components/User';
import SelectUser from '@/components/SelectUser';

import { AuditLogWithUser, UserEnum } from '@/types';
import { LOG_TYPE_OPTIONS, USER_REGION_SELECT } from '@/constants';
import { UserRegionType } from 'libs/users-client/src';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const DATE_FORMAT = 'YYYY-MM-DD';
const logTypeOptions = [
  { label: 'Users roles assignments', value: LOG_TYPE_OPTIONS.USERS_ROLES_ASSIGNMENTS },
  { label: 'Roles permissions assignments', value: LOG_TYPE_OPTIONS.ROLES_PERMISSIONS_ASSIGNMENTS },
  { label: 'Roles history', value: LOG_TYPE_OPTIONS.ROLES_HISTORY },
  { label: 'Permissions history', value: LOG_TYPE_OPTIONS.PERMISSIONS_HISTORY },
];

type FormFields = {
  role?: string;
  permission?: string;
  user?: string;
  affectedUser?: string;
  date?: [string, string];
  type?: string;
  region?: UserRegionType;
};

const createTimePeriodLinks = (router: NextRouter, queryDateFrom: string, queryDateTo: string) => {
  const generateDateRange = (
    startOf: 'week' | 'month',
    subtractValue = 0,
    unit: 'week' | 'month' = 'week',
    useCurrentDayAsEnd = false,
  ) => ({
    dateFrom: dayjs().subtract(subtractValue, unit).startOf(startOf).format(DATE_FORMAT),
    dateTo: useCurrentDayAsEnd
      ? dayjs().format(DATE_FORMAT)
      : dayjs().subtract(subtractValue, unit).endOf(startOf).format(DATE_FORMAT),
  });

  const params = {
    thisWeek: generateDateRange('week', 0, 'week', true),
    lastWeek: generateDateRange('week', 1),
    lastMonth: generateDateRange('month', 1, 'month'),
  };

  const isActive = (dateFrom: string, dateTo: string) => queryDateFrom === dateFrom && queryDateTo === dateTo;

  const createLink = (label: string, dateRange: { dateFrom: string; dateTo: string }) => ({
    label,
    query: {
      ...router.query,
      ...dateRange,
    },
    active: isActive(dateRange.dateFrom, dateRange.dateTo),
  });

  return [
    createLink('This week', params.thisWeek),
    createLink('Last week', params.lastWeek),
    createLink('Last month', params.lastMonth),
  ];
};

const determineUserType = (hasPermission: (permission: string) => boolean) => {
  if (hasPermission('RBAC:ROLE:CREATE')) {
    return UserEnum.ADMIN;
  } else if (hasPermission('RBAC:ROLE_ASSIGNMENT:CREATE')) {
    return UserEnum.OWNER;
  }
  return UserEnum.USER;
};

const Page: NextPage = () => {
  const router = useRouter();
  const page = parseInt(router.query.page as string, 10) || 1;
  const pageSize = parseInt(router.query.pageSize as string, 10) || 10;
  const search = router.query.search === 'true';
  const dateFrom = router.query.dateFrom
    ? (router.query.dateFrom as string)
    : dayjs().startOf('week').format(DATE_FORMAT);
  const dateTo = router.query.dateTo ? (router.query.dateTo as string) : dayjs().format(DATE_FORMAT);

  const [form] = Form.useForm();
  const { hasPermission } = usePermission();
  const [selectedRoles, setSelectedRoles] = useState<string[]>(router.query.role ? [router.query.role as string] : []);
  const [selectedRegion, setSelectedRegion] = useState<UserRegionType>(
    (router.query.region as UserRegionType) || USER_REGION_SELECT[0],
  );
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    router.query.permission ? [router.query.permission as string] : [],
  );
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs(dateFrom), dayjs(dateTo)]);
  const [selectedUser, setSelectedUser] = useState<string>(router.query.user as string);
  const [selectedAffectedUser, setSelectedAffectedUser] = useState<string>(router.query.affectedUser as string);
  const [selectedLogType, setSelectedLogType] = useState(logTypeOptions[0].value);
  const { accountId } = useAccount();
  const { data: roles } = useFetchRolesForOwner(accountId ?? '');
  const { data, loading, error, pagination } = useFetchAuditLog({
    page,
    pageSize,
    role: router.query.role as string,
    permission: router.query.permission as string,
    user: router.query.user as string,
    dateFrom,
    dateTo,
    affectedUser: router.query.affectedUser as string,
    type: router.query.type as string,
    region: router.query.region as UserRegionType,
  });

  const userType = determineUserType(hasPermission);

  useEffect(() => {
    form.setFieldsValue({
      role: selectedRoles[0],
      permission: selectedPermissions[0],
      user: selectedUser,
      affectedUser: selectedAffectedUser,
      date: [dateRange[0].format(DATE_FORMAT), dateRange[1].format(DATE_FORMAT)],
      type: selectedLogType,
      region: selectedRegion,
    });
  }, [
    form,
    selectedRoles,
    selectedPermissions,
    selectedUser,
    dateRange,
    selectedLogType,
    selectedAffectedUser,
    selectedRegion,
  ]);

  useEffect(() => {
    setSelectedRoles(router.query.role ? [router.query.role as string] : []);
    setSelectedPermissions(router.query.permission ? [router.query.permission as string] : []);
    setSelectedUser(router.query.user as string);
    setSelectedAffectedUser(router.query.affectedUser as string);
    if (router.query.dateFrom && router.query.dateTo) {
      setDateRange([dayjs(router.query.dateFrom as string), dayjs(router.query.dateTo as string)]);
    }
    setSelectedLogType(router.query.type ? (router.query.type as string) : 'users_roles_assignments');
    setSelectedRegion((router.query.region as UserRegionType) || USER_REGION_SELECT[0]);
  }, [
    router.query.role,
    router.query.permission,
    router.query.user,
    router.query.dateFrom,
    router.query.dateTo,
    router.query.type,
    router.query.affectedUser,
    router.query.region,
  ]);

  const handleRolesChange = (role: string[]) => {
    setSelectedRoles(Array.isArray(role) ? role : [role]);
  };

  const handlePermissionChange = (permission: string[]) => {
    setSelectedPermissions(Array.isArray(permission) ? permission : [permission]);
  };

  const handleUsersChange = (emails: string[]) => {
    setSelectedUser(emails[0]);
  };

  const handleAffectedUsersChange = (emails: string[]) => {
    setSelectedAffectedUser(emails[0]);
  };

  const handleDateChange = (_: unknown, dateStrings: [string, string]) => {
    setDateRange([dayjs(dateStrings[0]), dayjs(dateStrings[1])]);
  };

  const handleLogTypeChange = ({ target: { value } }: RadioChangeEvent) => {
    setSelectedLogType(value);
  };

  const handleRegionChange = (e: RadioChangeEvent) => {
    setSelectedRegion(e.target.value);
  };

  const onFinish = (values: FormFields) => {
    router.push({
      query: {
        ...router.query,
        role: values.role,
        permission: values.permission,
        user: values.user,
        affectedUser: values.affectedUser,
        dateFrom: dateRange[0].format(DATE_FORMAT),
        dateTo: dateRange[1].format(DATE_FORMAT),
        page: 1,
        type: values.type,
        search: true,
        region: values.region,
      },
    });
  };

  const handleTableOnChange: TableProps['onChange'] = (pagination) => {
    router.push({
      query: {
        ...router.query,
        page: pagination.current,
        pageSize: pagination.pageSize,
      },
    });
  };

  if (userType === UserEnum.USER) {
    return <Alert message="Error" description="Unauthorized" type="error" showIcon />;
  }

  const showOnlyRolesIds = [];
  if (userType === UserEnum.OWNER) {
    showOnlyRolesIds.push(...(roles?.map((role) => role.roleId) ?? []));
  }

  const clearAllFilters = () => {
    router.push({
      query: {
        page: 1,
        pageSize: 10,
      },
    });
  };

  const canPerformSearch = () => {
    return !!selectedRoles.length || !!selectedPermissions.length || !!selectedUser || !!selectedAffectedUser;
  };

  return (
    <>
      <Head title="Audit log" />
      <main>
        <Form form={form} layout="vertical" onFinish={onFinish} className="!mb-4" disabled={loading}>
          {userType === UserEnum.ADMIN && (
            <Form.Item name="type">
              <Radio.Group
                options={logTypeOptions}
                onChange={handleLogTypeChange}
                value={selectedLogType}
                optionType="button"
              />
            </Form.Item>
          )}
          <div className="flex flex-col space-y-4 mb-4 sm:mb-0 sm:flex-row sm:items-top sm:space-x-4 sm:space-y-0">
            {selectedLogType.includes('users') && (
              <Form.Item name="region" label="Region">
                <Radio.Group onChange={handleRegionChange} options={USER_REGION_SELECT} />
              </Form.Item>
            )}
            {selectedLogType.includes('role') && (
              <Form.Item name="role" label="Role" className="w-full !mb-0">
                <SelectRoles
                  mode="multiple"
                  maxCount={1}
                  showOnlyRolesIds={showOnlyRolesIds}
                  allowClear
                  deleted={true}
                  selected={selectedRoles}
                  onRolesChange={handleRolesChange}
                />
              </Form.Item>
            )}
            {userType === UserEnum.ADMIN && selectedLogType.includes('permissions') && (
              <Form.Item name="permission" label="Permission" className="w-full">
                <SelectPermissions
                  allowClear
                  mode="multiple"
                  maxCount={1}
                  deleted={true}
                  initialPermissions={selectedPermissions}
                  onPermissionChange={handlePermissionChange}
                />
              </Form.Item>
            )}
            <Form.Item name="user" label="User" className="w-full">
              <SelectUser
                initialEmails={selectedUser ? [selectedUser] : []}
                onUsersChange={handleUsersChange}
                maxCount={1}
              />
            </Form.Item>
            {selectedLogType.includes('users') && (
              <>
                <Form.Item name="affectedUser" label="Affected User" className="w-full">
                  <SelectUser
                    initialEmails={selectedAffectedUser ? [selectedAffectedUser] : []}
                    onUsersChange={handleAffectedUsersChange}
                    maxCount={1}
                  />
                </Form.Item>
              </>
            )}
            <Form.Item name="date" label="Time period" className="w-full">
              <div>
                <RangePicker allowClear={false} value={dateRange} onChange={handleDateChange} />
                <div className="my-2">
                  <Space>
                    {createTimePeriodLinks(router, dateFrom, dateTo).map((link) => {
                      if (link.active) return link.label;
                      return (
                        <Link
                          key={link.label}
                          href={{
                            query: link.query,
                          }}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </Space>
                </div>
              </div>
            </Form.Item>
          </div>
          <div className="flex items-center">
            <Space>
              <Button
                key="submit"
                type="primary"
                disabled={!canPerformSearch()}
                loading={loading}
                onClick={() => form.submit()}
              >
                View log
              </Button>
              <Button type="link" disabled={!canPerformSearch() || !search} onClick={clearAllFilters}>
                Clear all filters
              </Button>
            </Space>
          </div>
        </Form>
        {error && <Alert message="Error" description={handleError(error)} type="error" showIcon />}
        {!error && search && (
          <>
            <Flex gap="middle" justify="space-between">
              <Title level={2} className="my-0">
                Audit log
              </Title>
              <Space>
                <Link
                  target="_blank"
                  href={{ pathname: `/api/rbac/audit`, query: { ...router.query, download: 'csv' } }}
                >
                  <Button disabled={data.length === 0} icon={<DownloadOutlined />}>
                    Download as CSV
                  </Button>
                </Link>
              </Space>
            </Flex>
            <ResponsiveTable
              rowCount={pagination?.pageSize}
              pagination={{
                pageSize: pagination?.pageSize,
                current: pagination?.page,
                total: pagination?.total,
              }}
              onChange={handleTableOnChange}
              loading={loading}
              dataSource={data}
              columns={[
                {
                  title: 'User',
                  dataIndex: 'user',
                  key: 'user',
                  render: (_, record: AuditLogWithUser) => <User userId={record.userId} user={record.user} />,
                },
                ...(selectedLogType === LOG_TYPE_OPTIONS.USERS_ROLES_ASSIGNMENTS
                  ? [
                      {
                        title: 'Region',
                        dataIndex: 'region',
                        key: 'region',
                      },
                    ]
                  : []),
                {
                  title: 'Action',
                  dataIndex: 'action',
                  key: 'action',
                },
                {
                  title: 'Object',
                  dataIndex: 'objectType',
                  key: 'objectType',
                },
                {
                  title: 'Object name',
                  dataIndex: 'objectName',
                  key: 'objectName',
                },
                {
                  title: 'Affected object',
                  dataIndex: 'affectedObject',
                  key: 'affectedObject',
                  render: (_, record: AuditLogWithUser) => {
                    if (record.affectedObject && record.affectedObjectUser) {
                      return <User userId={record.affectedObject} user={record.affectedObjectUser} />;
                    }
                    return record.affectedObject || '-';
                  },
                },
                {
                  title: 'Date',
                  dataIndex: 'date',
                  key: 'date',
                  render: (_, record: AuditLogWithUser) => dayjs(record.date).format('YYYY-MM-DD HH:mm:ss'),
                },
              ]}
            />
          </>
        )}
      </main>
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
