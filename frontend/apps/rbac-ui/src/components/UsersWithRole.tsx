import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Alert, Button, Flex, Space, Typography, TableProps } from 'antd';

import AssignRoleToUserModal from '@/components/AssignRoleToUserModal';
import ResponsiveTable from './ResponsiveTable';
import User from '@/components/User';
import useFetchUsersRoles from '@/hooks/useFetchUsersRoles';
import { UserRolesCreateResponseWithUser } from '@/types';
import RevokeRoleModal from '@/components/RevokeRoleModal';
import { LOG_TYPE_OPTIONS } from '@/constants';

import type { RolesResponse } from 'libs/rbac-client/src';

type UsersWithRoleProps = {
  role: RolesResponse;
};

const { Title } = Typography;

const UsersWithRole = ({ role }: UsersWithRoleProps) => {
  const router = useRouter();
  const page = parseInt(router.query.page as string, 10) || 1;
  const pageSize = parseInt(router.query.pageSize as string, 10) || 10;
  const { data, loading, error, pagination } = useFetchUsersRoles({ roleIds: role.id, page, pageSize });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRolesCreateResponseWithUser[]>([]);

  const [isOpenRevokeModal, setIsOpenRevokeModal] = useState<boolean>(false);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRolesCreateResponseWithUser | null>(null);

  const handleAssignedUsers = () => {
    setIsModalOpen(false);
    router.reload();
  };

  const handleLeaveRole = async (role: UserRolesCreateResponseWithUser) => {
    setSelectedUserRole(role);
    setIsOpenRevokeModal(true);
  };

  const handleSuccess = () => {
    setIsOpenRevokeModal(false);
    setSelectedUserRole(null);
    router.reload();
  };

  const handleCancel = () => {
    setIsOpenRevokeModal(false);
    setSelectedUserRole(null);
  };

  useEffect(() => {
    if (data) {
      setUserRoles(data);
    }
  }, [data]);

  const handleTableOnChange: TableProps['onChange'] = (pagination) => {
    router.push(
      {
        query: {
          ...router.query,
          page: pagination.current,
          pageSize: pagination.pageSize,
        },
      },
      undefined,
      { shallow: true },
    );
  };

  return (
    <div className="mt-8">
      <Flex gap="middle" justify="space-between">
        <Title level={3}>Users with Role</Title>
        <Space>
          <Link
            href={{
              pathname: '/audit',
              query: { role: role.id, type: LOG_TYPE_OPTIONS.USERS_ROLES_ASSIGNMENTS, search: true },
            }}
          >
            <Button>Audit log</Button>
          </Link>
          <Button onClick={() => setIsModalOpen(true)}>Assign to user</Button>
        </Space>
      </Flex>
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {!error && (
        <ResponsiveTable
          pagination={{
            pageSize: pagination?.pageSize,
            current: pagination?.page,
            total: pagination?.total,
          }}
          onChange={handleTableOnChange}
          loading={loading}
          dataSource={userRoles || []}
          columns={[
            {
              title: 'Name',
              dataIndex: 'userId',
              key: 'name',
              render: (_, record: UserRolesCreateResponseWithUser) => (
                <User user={record.user} userId={record.userId} show="name" />
              ),
            },
            {
              title: 'Email',
              dataIndex: 'userId',
              key: 'email',
              render: (_, record: UserRolesCreateResponseWithUser) => (
                <User user={record.user} userId={record.userId} show="email" />
              ),
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
              render: (_, record: UserRolesCreateResponseWithUser) => record.scopeType || '-',
            },
            {
              title: 'Scope value',
              dataIndex: 'scopevalue',
              key: 'scopeValue',
              render: (_, record: UserRolesCreateResponseWithUser) => record.scopeValue || '-',
            },
            {
              title: 'Actions',
              key: 'action',
              render: (text: string, record: UserRolesCreateResponseWithUser) => (
                <Button danger type="link" onClick={() => handleLeaveRole(record)}>
                  Revoke role
                </Button>
              ),
            },
          ]}
        />
      )}
      <AssignRoleToUserModal
        role={role}
        isModalOpen={isModalOpen}
        onSuccess={handleAssignedUsers}
        onCancel={() => setIsModalOpen(false)}
      />
      {selectedUserRole && (
        <RevokeRoleModal
          type="all"
          userRole={selectedUserRole}
          isModalOpen={isOpenRevokeModal}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default UsersWithRole;
