import { useState } from 'react';
import { Button, Flex, Input, Modal, Space, Tag, Typography, message } from 'antd';
import Link from 'next/link';

import type { RoleIdResponse, PermissionsResponse } from 'libs/rbac-client/src';

import ResponsiveTable from '@/components/ResponsiveTable';
import User from '@/components/User';
import AssignPermissionModal from '@/components/AssignPermisssionToRoleModal';
import { ShortenText } from '@/components/ShortenText';
import { handleError } from '@/utils';

import { PermissionWithUser } from '@/types';

type AssignedRolePermissionsProps = {
  role: RoleIdResponse;
  onAssignedPermission?: () => void;
  onRevokePermission?: () => void;
  disabled?: boolean;
};

const { Title } = Typography;
const { Search } = Input;

const AssignedRolePermissions = ({
  role,
  onAssignedPermission,
  onRevokePermission,
  disabled = false,
}: AssignedRolePermissionsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const data = role.permissions?.map((permission) => ({
    ...permission,
    key: permission.id,
  }));

  const filteredData = data?.filter((permission) => permission.code.toLowerCase().includes(searchText.toLowerCase()));

  const handleRevoke = async (permission: PermissionsResponse) => {
    try {
      const response = await fetch(`/api/rbac/roles/${role.id}/permissions/${permission.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      onRevokePermission && onRevokePermission();
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    }
  };

  return (
    <div className="mt-8">
      <Title level={3}>Assigned permissions</Title>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-4">
        <Search
          allowClear
          placeholder="Search by permission code"
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {!disabled && <Button onClick={() => setIsModalOpen(true)}>Assign permission</Button>}
      </div>
      <Space></Space>
      {filteredData && (
        <ResponsiveTable
          loading={false}
          dataSource={filteredData}
          columns={[
            {
              title: 'Permission code',
              dataIndex: 'code',
              key: 'code',
              render: (_: string, record: PermissionsResponse) =>
                !disabled ? <Link href={`/permissions/${record.id}`}>{record.code}</Link> : record.code,
            },
            {
              title: 'Description',
              dataIndex: 'description',
              key: 'description',
            },
            {
              title: 'Categories',
              dataIndex: 'categories',
              key: 'categories',
              render: (_: string, record: PermissionsResponse) =>
                record.categories?.map((category) =>
                  !disabled ? (
                    <Link key={category.id} href={`/categories/${category.id}`}>
                      <ShortenText text={category.name ?? 'No name'} />
                    </Link>
                  ) : (
                    <Tag key={category.id}>
                      <ShortenText text={category.name ?? 'No name'} />
                    </Tag>
                  ),
                ),
            },
            {
              title: 'Created by',
              dataIndex: 'createdBy',
              key: 'createdBy',
              render: (_: string, record: PermissionWithUser) => (
                <User userId={record.createdBy} user={record.createdByUser} />
              ),
            },
            ...(!disabled
              ? [
                  {
                    title: 'Actions',
                    key: 'action',
                    render: (_: string, record: PermissionsResponse) => (
                      <Button
                        type="link"
                        danger
                        onClick={() =>
                          Modal.confirm({
                            title: 'Confirm',
                            content: (
                              <>
                                Are you sure you want to revoke <strong>{record.code}</strong> permission?
                              </>
                            ),
                            onOk: () => handleRevoke(record),
                          })
                        }
                      >
                        Revoke permission
                      </Button>
                    ),
                  },
                ]
              : []),
          ]}
        />
      )}
      <AssignPermissionModal
        role={role}
        isModalOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          onAssignedPermission && onAssignedPermission();
        }}
      />
    </div>
  );
};

export default AssignedRolePermissions;
