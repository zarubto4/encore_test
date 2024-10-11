import { Typography, Alert, Button, message, Flex, ConfigProvider, Empty, Tag, Modal, Space, Input } from 'antd';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import router from 'next/router';

import useFetchPermissions from '@/hooks/useFetchPermissions';
import ResponsiveTable from '@/components/ResponsiveTable';
import { handleError } from '@/utils';
import User from '@/components/User';
import AddCategoryModal from '@/components/AddCategoryModal';

import type { CategoriesWithUser, PermissionWithUser } from '@/types';

type PermissionInSelectedCategoryProps = {
  category: CategoriesWithUser;
};

const { Title } = Typography;
const { Search } = Input;

const PermissionInSelectedCategory = ({ category }: PermissionInSelectedCategoryProps) => {
  const { data, error, loading } = useFetchPermissions({ categoryId: category.id });
  const [permissionData, setPermissionData] = useState<PermissionWithUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (data) {
      setPermissionData(data);
    }
  }, [data]);

  const handleRemovePermission = async (permission: PermissionWithUser) => {
    try {
      const response = await fetch(`/api/rbac/permissions/${permission.id}/categories/${category.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      message.success('Permission removed successfully');
      setPermissionData(permissionData.filter((p) => p.id !== permission.id));
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    }
  };

  const customizeRenderEmpty = () => (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No permission for this category" />
  );

  const handleSuccess = () => {
    message.success('Category assigned successfully');
    setIsModalOpen(false);
    router.reload();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((permission: PermissionWithUser) => {
      const nameMatches = permission.code.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatches;
    });
  }, [data, searchQuery]);

  return (
    <>
      <Flex gap="middle" justify="space-between" className="mt-8">
        <Title level={3}>Permissions where this category is assigned</Title>
        <Space>
          <Button onClick={() => setIsModalOpen(true)}>Assign to permission</Button>
        </Space>
      </Flex>
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {!error && (
        <ConfigProvider renderEmpty={customizeRenderEmpty}>
          <Search
            className="md:w-1/2 mb-4"
            placeholder="Search by permission code"
            value={searchQuery}
            onChange={handleSearch}
          />
          <ResponsiveTable
            loading={loading}
            dataSource={filteredData}
            columns={[
              {
                title: 'Permission Code',
                dataIndex: 'code',
                key: 'code',
                render: (text: string, record: PermissionWithUser) => (
                  <Link href={`/permissions/${record.id}`}>{text}</Link>
                ),
              },
              {
                title: 'Permission Description',
                dataIndex: 'description',
                key: 'description',
              },
              {
                title: 'Category',
                dataIndex: 'category',
                key: 'category',
                render: (text: string, record: PermissionWithUser) =>
                  record.categories &&
                  record.categories.map((category) => (
                    <Link key={category.id} href={`/categories/${category.id}`}>
                      <Tag color="blue">{category.name}</Tag>
                    </Link>
                  )),
              },
              {
                title: 'Created By',
                dataIndex: 'createdByUser',
                key: 'createdBy',
                render: (text: string, record: PermissionWithUser) => (
                  <User userId={record.createdBy} user={record.createdByUser} />
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (text: string, record: PermissionWithUser) => (
                  <Button
                    danger
                    type="link"
                    onClick={() =>
                      Modal.confirm({
                        title: 'Confirm',
                        okText: 'Remove',
                        content: (
                          <>
                            Are you sure you want to remove category <strong>{category.name}</strong> from permission{' '}
                            <strong>{record.code}</strong>?
                          </>
                        ),
                        onOk: () => handleRemovePermission(record),
                      })
                    }
                  >
                    Remove from here
                  </Button>
                ),
              },
            ]}
          />
        </ConfigProvider>
      )}
      <AddCategoryModal
        type="permission"
        category={category}
        isModalOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default PermissionInSelectedCategory;
