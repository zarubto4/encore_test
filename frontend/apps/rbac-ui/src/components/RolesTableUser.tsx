import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Typography, Alert, Button } from 'antd';
import { useRouter } from 'next/router';
import useFetchUsersRoles from '@/hooks/useFetchUsersRoles';
import ResponsiveTable from '@/components/ResponsiveTable';
import { AccountSuccessResponse } from '@vpcs/users-client';
import RevokeRoleModal from '@/components/RevokeRoleModal';
import type { UserRolesCreateResponseWithUser } from '@/types';

const { Title } = Typography;

type RoleTableUserProps = {
  user: AccountSuccessResponse;
};

const RolesTableUser = ({ user }: RoleTableUserProps) => {
  const [userRoles, setUserRoles] = useState<UserRolesCreateResponseWithUser[]>([]);
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRolesCreateResponseWithUser | null>(null);
  const { data, loading, error } = useFetchUsersRoles({
    userIds: user.id,
  });

  const handleSuccess = () => {
    setIsOpenModal(false);
    setSelectedUserRole(null);
    router.reload();
  };

  const handleCancel = () => {
    setIsOpenModal(false);
    setSelectedUserRole(null);
  };

  const handleLeaveRole = async (role: UserRolesCreateResponseWithUser) => {
    setSelectedUserRole(role);
    setIsOpenModal(true);
  };

  useEffect(() => {
    if (data) {
      setUserRoles(data);
    }
  }, [data]);

  return (
    <>
      <Title level={3} className="mt-4">
        {user.email}
      </Title>
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {!error && (
        <>
          <ResponsiveTable
            loading={loading}
            dataSource={userRoles}
            columns={[
              {
                title: 'Role name',
                dataIndex: 'name',
                key: 'name',
                render: (_: string, record: UserRolesCreateResponseWithUser) => (
                  <Link href={`/roles/${record.roleId}`}>{record.role.name}</Link>
                ),
              },
              {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
                render: (_: string, record: UserRolesCreateResponseWithUser) =>
                  record.role.description || record.comments || '-',
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
                render: (_: string, record: UserRolesCreateResponseWithUser) => record.scopeType || '-',
              },
              {
                title: 'Scope value',
                dataIndex: 'scopevalue',
                key: 'scopeValue',
                render: (_: string, record: UserRolesCreateResponseWithUser) => record.scopeValue || '-',
              },
              {
                title: 'Actions',
                key: 'action',
                render: (_: string, record: UserRolesCreateResponseWithUser) => (
                  <Button type="link" onClick={() => handleLeaveRole(record)}>
                    Revoke role
                  </Button>
                ),
              },
            ]}
          />
          {selectedUserRole && (
            <RevokeRoleModal
              type="all"
              userRole={selectedUserRole}
              isModalOpen={isOpenModal}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </>
      )}
    </>
  );
};

export default RolesTableUser;
