import router from 'next/router';
import { useMemo, useState } from 'react';
import { Alert, Button, Flex, Modal, Space, Tag, Typography, message, Input } from 'antd';
import Link from 'next/link';

import ResponsiveTable from './ResponsiveTable';
import useFetchRoles from '@/hooks/useFetchRoles';
import AssignPermisssionToRoleModal from '@/components/AssignPermisssionToRoleModal';
import User from '@/components/User';
import { handleError } from '@/utils';
import { LOG_TYPE_OPTIONS } from '@/constants';

import type { PermissionWithUser, RoleWithUser } from '@/types';

type RolesWithPermissionProps = {
  permission: PermissionWithUser;
};

const { Title } = Typography;
const { Search } = Input;

const RolesWithPermission = ({ permission }: RolesWithPermissionProps) => {
  const { data, loading, error } = useFetchRoles({ permissionId: permission.id });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const assignedRolesIds = data?.map((role) => role.id) || [];

  const handleRevoke = async (role: RoleWithUser) => {
    try {
      const response = await fetch(`/api/rbac/roles/${role.id}/permissions/${permission.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      message.success('Permission revoked successfully');
      router.reload();
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    message.success('Permission added successfully');
    router.reload();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((role: RoleWithUser) => {
      const nameMatches = role.name.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatches;
    });
  }, [data, searchQuery]);

  return (
    <div>
      <Flex gap="middle" justify="space-between">
        <Title level={3}>Roles where this permission is assigned</Title>
        <Space>
          <Link
            href={{
              pathname: '/audit',
              query: { permission: permission.id, type: LOG_TYPE_OPTIONS.ROLES_PERMISSIONS_ASSIGNMENTS, search: true },
            }}
          >
            <Button>Audit log</Button>
          </Link>
          <Button onClick={() => setIsModalOpen(true)}>Assign to role</Button>
        </Space>
      </Flex>
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {!error && (
        <>
          <Search
            className="md:w-1/2 mb-4"
            placeholder="Search by role name"
            value={searchQuery}
            onChange={handleSearch}
          />
          <ResponsiveTable
            loading={loading}
            dataSource={filteredData || []}
            columns={[
              {
                title: 'Role',
                dataIndex: 'name',
                key: 'name',
                render: (_, record: RoleWithUser) => <Link href={`/roles/${record.id}`}>{record.name}</Link>,
              },
              {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
              },
              {
                title: 'Created By',
                dataIndex: 'createdBy',
                key: 'createdBy',
                render: (_, record: RoleWithUser) => <User userId={record.createdBy} user={record.createdByUser} />,
              },
              {
                title: 'Categories',
                dataIndex: 'categories',
                key: 'categories',
                render: (categories: { id: string; name: string }[]) =>
                  categories.map((category) => (
                    <Link key={category.id} href={`/categories/${category.id}`}>
                      <Tag style={{ cursor: 'pointer' }} color="blue">
                        {category.name}
                      </Tag>
                    </Link>
                  )),
              },
              {
                title: 'Actions',
                key: 'action',
                render: (text: string, record: RoleWithUser) => (
                  <Button
                    type="link"
                    onClick={() =>
                      Modal.confirm({
                        title: 'Confirm',
                        okText: 'Remove',
                        content: (
                          <>
                            Are you sure you want to remove permission <strong>{permission.code}</strong> from role{' '}
                            <strong>{record.name}</strong>?
                          </>
                        ),
                        onOk: () => handleRevoke(record),
                      })
                    }
                  >
                    Remove from role
                  </Button>
                ),
              },
            ]}
          />
        </>
      )}

      <AssignPermisssionToRoleModal
        permission={permission}
        hideRolesIds={assignedRolesIds}
        isModalOpen={isModalOpen}
        onSuccess={handleSuccess}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default RolesWithPermission;
