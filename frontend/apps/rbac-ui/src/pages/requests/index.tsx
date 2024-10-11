import { NextPage } from 'next';
import { Button, Flex, Typography, Alert, Tag, ConfigProvider, Empty, TableProps, Space } from 'antd';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import useFetchRoleRequests from '@/hooks/useFetchRoleRequests';
import { formatDateString } from '@/utils';
import Head from '@/components/Head';
import ResponsiveTable from '@/components/ResponsiveTable';
import User from '@/components/User';
import RequestApproveRejectModal from '@/components/RequestApproveRejectModal';
import { useAccount } from '@/contexts/AccountContext';
import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';
import { RoleRequestStatus } from '@vpcs/rbac-client';
import { ROLE_REQ_STATUS_COLOR, ROLE_REQ_STATUS_DISPLAY } from '@/constants';
import SelectRequestStatus from '@/components/SelectRequestStatus';
import RoleRequestModal from '@/components/RoleRequestModal';
import { UserEnum } from '@/types';
import useFetchUsersRoles from '@/hooks/useFetchUsersRoles';

import type { ColumnsType } from 'antd/lib/table';
import type { OwnerRoleRequest } from '@/types';

const { Title, Paragraph } = Typography;

const Page: NextPage = () => {
  const router = useRouter();
  const page = parseInt(router.query.page as string, 10) || 1;
  const pageSize = parseInt(router.query.pageSize as string, 10) || 10;
  

  const { accountId } = useAccount();
  const { hasPermission } = usePermission();
  const [selectedRoleRequest, setSelectedRoleRequest] = useState<OwnerRoleRequest | null>(null);
  const [action, setAction] = useState<RoleRequestStatus | null | undefined | ''>(null);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [params, setParams] = useState<{
    requesterId?: string;
    roleOwnerId?: string;
    roleId?: string;
    status?: RoleRequestStatus;
    page?: number;
    pageSize?: number;
  }>({
    status: (router.query.status as RoleRequestStatus) ?? RoleRequestStatus.PENDING,
    page,
    pageSize,
  });

  useEffect(() => {
    const { status } = router.query;
    setParams((prevParams) => ({
      ...prevParams,
      status: (status as RoleRequestStatus) ?? RoleRequestStatus.PENDING,
      page,
      pageSize,
    }));
  }, [router.query, page, pageSize]);

  const userType = hasPermission('RBAC:ROLE:CREATE')
    ? UserEnum.ADMIN
    : hasPermission('RBAC:ROLE_REQUEST:UPDATE')
    ? UserEnum.OWNER
    : UserEnum.USER;

  if (userType === UserEnum.USER && accountId) {
    params.requesterId = accountId;
  }

  if (userType === UserEnum.OWNER && accountId) {
    params.roleOwnerId = accountId;
  }

  const { data, loading, error, pagination } = useFetchRoleRequests(params);
  const { data: myRoles } = useFetchUsersRoles({
    userIds: accountId,
    fetchKey: 0,
  });

  const handleTableOnChange: TableProps['onChange'] = (pagination) => {
    router.push({
      query: {
        ...router.query,
        page: pagination.current,
        pageSize: pagination.pageSize,
      },
    });
  };

  const handleAction = (roleRecord: OwnerRoleRequest, action: RoleRequestStatus) => {
    setAction(action);
    setSelectedRoleRequest(roleRecord);
    setIsOpenModal(true);
  };

  const handleSuccess = () => {
    setSelectedRoleRequest(null);
    setAction(null);
    setIsOpenModal(false);
    router.reload();
  };

  const handleCancel = () => {
    setSelectedRoleRequest(null);
    setAction(null);
    setIsOpenModal(false);
  };

  const handleSuccessRequest = () => {
    setIsRequestModalOpen(false);
    router.reload();
  }

  const handleCancelRequest = () => {
    setIsRequestModalOpen(false);
  }

  const handleStatusChanged = (status: RoleRequestStatus) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        status,
        page: 1,
      },
    });
  };

  const actionButtons = (record: OwnerRoleRequest) => {
    if (userType === UserEnum.OWNER || userType === UserEnum.ADMIN) {
      if (record.status === RoleRequestStatus.PENDING) {
        return (
          <>
            <Button type="link" onClick={() => handleAction(record, RoleRequestStatus.APPROVED)}>
              Approve
            </Button>
            <Button type="link" danger onClick={() => handleAction(record, RoleRequestStatus.REJECTED)}>
              Reject
            </Button>
          </>
        );
      }
    }

    if (record.status === RoleRequestStatus.PENDING) {
      return (
        <Button type="link" onClick={() => handleAction(record, RoleRequestStatus.CANCELLED)}>
          Cancel request
        </Button>
      );
    }
    return '-';
  };

  const columnRoleReqTable: ColumnsType<OwnerRoleRequest> = [
    {
      title: 'Requested By',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
      render: (_: string, record: OwnerRoleRequest) => (
        <User show="name" userId={record.requesterId} user={record.requestedBy} />
      ),
    },
    {
      title: 'Role name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: OwnerRoleRequest) => <Link href={`/roles/${record.roleId}`}>{text}</Link>,
    },
    {
      title: 'Reason',
      dataIndex: 'requesterComment',
      key: 'requesterComment',
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: 'Scope type',
      dataIndex: 'scopeType',
      key: 'scopeType',
      render: (_, record: OwnerRoleRequest) => record.scopeType,
    },
    {
      title: 'Scope value',
      dataIndex: 'scopevalue',
      key: 'scopeValue',
      render: (_, record: OwnerRoleRequest) => record.scopeValue || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_: string, record: OwnerRoleRequest) => (
        <>
          <Tag color={ROLE_REQ_STATUS_COLOR[record.status]}>{ROLE_REQ_STATUS_DISPLAY[record.status]}</Tag>
          {record.approverId && <User userId={record.approverId} user={record.approvedBy} />}
          {record.approverComment && <Paragraph className="!my-0">{record.approverComment}</Paragraph>}
        </>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'lastModifiedAt',
      key: 'lastModifiedAt',
      render: (_: string, record: OwnerRoleRequest) => {
        if (record.lastModifiedAt) {
          return formatDateString(record.lastModifiedAt);
        } else if (record.createdAt) {
          return formatDateString(record.createdAt);
        }
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: string, record: OwnerRoleRequest) => actionButtons(record),
    },
  ];

  const customizeRenderEmpty = () => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No requests" />;

  return (
    <>
      <Head title="Role request queue" />
      <main>
        <Flex gap="middle" justify="space-between">
          <Title level={2} className="my-0">
            Role request queue
          </Title>
          <Space>
            <Button type="primary" onClick={() => setIsRequestModalOpen(true)}>
              Request roles
            </Button>
          </Space>
        </Flex>

        {error && <Alert message="Error" description={error} type="error" showIcon />}
        {!error && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-4">
              <SelectRequestStatus selectedStatus={params.status} onStatusChanged={handleStatusChanged} />
            </div>
            <ConfigProvider renderEmpty={customizeRenderEmpty}>
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
                columns={columnRoleReqTable}
              />
            </ConfigProvider>
          </>
        )}
        {action && (
          <RequestApproveRejectModal
            roleRequest={selectedRoleRequest}
            isModalOpen={isOpenModal}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            status={action}
          />
        )}
        <RoleRequestModal
          myRolesIds={myRoles?.map((role) => role.roleId)}
          isModalOpen={isRequestModalOpen}
          onSuccess={handleSuccessRequest}
          onCancel={handleCancelRequest}
        />
      </main>
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
