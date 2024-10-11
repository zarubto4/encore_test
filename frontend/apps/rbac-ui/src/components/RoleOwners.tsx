import router from 'next/router';

import { useEffect, useState } from 'react';
import { Typography, Alert, Button, message, Flex, ConfigProvider, Empty, Modal } from 'antd';

import ResponsiveTable from '@/components/ResponsiveTable';
import User from '@/components/User';
import AddOwnerToRoleModal from '@/components/AddOwnerToRoleModal';
import { handleError } from '@/utils';

import type { RoleOwnerWithUser, RoleWithUser } from '@/types';

type RoleOwnersPropos = {
  role: RoleWithUser;
  disabled?: boolean;
  owners?: RoleOwnerWithUser[];
  loading?: boolean;
  error?: string | null;
};

const { Title } = Typography;

const RoleOwners = ({ role, disabled = false, owners: data, loading, error }: RoleOwnersPropos) => {
  const [owners, setOwners] = useState<RoleOwnerWithUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      setOwners(data);
    }
  }, [data]);

  const handleRemoveOwner = async (ownerId: string) => {
    try {
      const response = await fetch(`/api/rbac/roles/owners?roleId=${role.id}&ownerId=${ownerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      message.success('Owner removed successfully');
      setOwners((Owners) => Owners.filter((owner) => owner.ownerId !== ownerId));
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    }
  };

  const handleAddOwner = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = (isModalOpen: boolean) => {
    setIsModalOpen(isModalOpen);
    if (!isModalOpen) {
      router.reload();
    }
  };

  const customizeRenderEmpty = () => (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No owners for this role" />
  );

  return (
    <>
      <Flex gap="middle" justify="space-between">
        <Title className="my-0" level={3}>
          Owners
        </Title>
        {!disabled && <Button onClick={handleAddOwner}>Add owner</Button>}
      </Flex>
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {!error && (
        <ConfigProvider renderEmpty={customizeRenderEmpty}>
          <ResponsiveTable
            loading={false}
            columns={[
              {
                title: 'Name',
                dataIndex: 'ownerId',
                key: 'name',
                render: (_, record: RoleOwnerWithUser) =>
                  record.ownerId && <User userId={record.ownerId} user={record.ownerUser} show="name" />,
              },
              {
                title: 'Email',
                dataIndex: 'ownerId',
                key: 'email',
                render: (_, record: RoleOwnerWithUser) =>
                  record.ownerId && <User userId={record.ownerId} user={record.ownerUser} show="email" />,
              },
              {
                title: 'Region',
                dataIndex: 'region',
                key: 'region',
              },
              ...(!disabled
                ? [
                    {
                      title: 'Actions',
                      dataIndex: 'actions',
                      key: 'actions',
                      render: (_: string, record: RoleOwnerWithUser) => (
                        <Button
                          type="link"
                          danger
                          onClick={() =>
                            Modal.confirm({
                              title: 'Confirm',
                              okText: 'Remove',
                              content: (
                                <>
                                  Are you sure you want to remove owner <strong>{record.ownerUser.email}</strong>?
                                </>
                              ),
                              onOk: () => handleRemoveOwner(record.ownerId),
                            })
                          }
                        >
                          Remove owner
                        </Button>
                      ),
                    },
                  ]
                : []),
            ]}
            pagination={false}
            dataSource={owners}
          />
        </ConfigProvider>
      )}
      <AddOwnerToRoleModal isModalOpen={isModalOpen} onCancel={handleCancel} onSuccess={handleSuccess} role={role} />
    </>
  );
};

export default RoleOwners;
