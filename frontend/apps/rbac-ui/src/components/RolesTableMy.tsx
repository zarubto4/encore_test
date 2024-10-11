import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Typography, Alert, Button, ConfigProvider, Empty } from 'antd';

import ResponsiveTable from '@/components/ResponsiveTable';

import type { UserRolesCreateResponseWithUser } from '@/types';
import User from '@/components/User';
import { formatDateString } from '@/utils';
import RevokeRoleModal from './RevokeRoleModal';
import useFetchMyRoles from '@/hooks/useFetchMyRoles';

const { Title, Text } = Typography;

type RolesTableMyProps = {
  myRolesLoaded?: (ids: string[]) => void;
};

const RolesTableMy: React.FC<RolesTableMyProps> = ({ myRolesLoaded }) => {
  const [fetchKey, setFetchKey] = useState<number>(0);
  const [myRoles, setMyRoles] = useState<UserRolesCreateResponseWithUser[]>([]);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRolesCreateResponseWithUser | null>(null);

  const { data, loading, error } = useFetchMyRoles({
    fetchKey,
  });

  const handleSuccess = () => {
    setIsOpenModal(false);
    setSelectedUserRole(null);
    setFetchKey((prev) => prev + 1);
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
      setMyRoles(data);
      myRolesLoaded?.(data.map((r) => r.roleId));
    }
  }, [data, myRolesLoaded]);

  const customizeRenderEmpty = () => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="You have no roles" />;

  return (
    <>
      <Title level={3}>My roles</Title>
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {!error && (
        <>
          <ConfigProvider renderEmpty={customizeRenderEmpty}>
            <ResponsiveTable
              loading={loading}
              dataSource={myRoles}
              columns={[
                {
                  title: 'Role name',
                  dataIndex: 'name',
                  key: 'name',
                  render: (_, record: UserRolesCreateResponseWithUser) => (
                    <Link href={`/roles/${record.roleId}`}>{record.role.name}</Link>
                  ),
                },
                {
                  title: 'Description',
                  dataIndex: 'description',
                  key: 'description',
                  render: (_, record: UserRolesCreateResponseWithUser) =>
                    record.role.description || record.comments || '-',
                },
                {
                  title: 'Region',
                  dataIndex: 'region',
                  key: 'region',
                },
                {
                  title: 'Granted By',
                  dataIndex: 'createdBy',
                  key: 'createdBy',
                  render: (_: string, record: UserRolesCreateResponseWithUser) => {
                    return (
                      <>
                        <User userId={record.createdBy} user={record.createdByUser} />
                        <Text>{formatDateString(record.createdAt)}</Text>
                      </>
                    );
                  },
                },
                {
                  title: 'Scope type',
                  dataIndex: 'scopeType',
                  key: 'scopeType',
                  render: (_, record: UserRolesCreateResponseWithUser) => record.scopeType,
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
                  render: (_, record: UserRolesCreateResponseWithUser) => (
                    <Button type="link" onClick={() => handleLeaveRole(record)}>
                      Leave role
                    </Button>
                  ),
                },
              ]}
            />
          </ConfigProvider>
          {selectedUserRole && (
            <RevokeRoleModal
              type="my"
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

export default RolesTableMy;
