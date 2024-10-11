import router from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Typography, Alert, Button, message, Flex, ConfigProvider, Empty, Tag, Modal, Space, Input } from 'antd';
import Link from 'next/link';

import useFetchRoles from '@/hooks/useFetchRoles';
import ResponsiveTable from '@/components/ResponsiveTable';
import User from '@/components/User';
import { handleError } from '@/utils';
import AddCategoryModal from '@/components/AddCategoryModal';

import type { RoleWithUser, CategoriesWithUser } from '@/types';

type RolesInSelectedCategoryProps = {
  category: CategoriesWithUser;
};

const { Title } = Typography;
const { Search } = Input;

const RolesInSelectedCategory = ({ category }: RolesInSelectedCategoryProps) => {
  const { data, error, loading } = useFetchRoles({ categoryId: category.id });
  const [rolesData, setRolesData] = useState<RoleWithUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (data) {
      setRolesData(data);
    }
  }, [data]);

  const handleRemoveRole = async (roles: RoleWithUser) => {
    try {
      const response = await fetch(`/api/rbac/roles/${roles.id}/categories/${category.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      message.success('Role removed successfully');
      setRolesData(rolesData.filter((r) => r.id !== roles.id));
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    }
  };

  const customizeRenderEmpty = () => (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No roles for this category" />
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
    
    return data.filter((category: CategoriesWithUser) => {
      const nameMatches = category.name.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatches;
    });
  }, [data, searchQuery]);

  return (
    <>
      <Flex gap="middle" justify="space-between">
        <Title className="my-0" level={3}>
          Roles where this category is assigned
        </Title>
        <Space>
          <Button onClick={() => setIsModalOpen(true)}>Assign to role</Button>
        </Space>
      </Flex>
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {!error && (
        <ConfigProvider renderEmpty={customizeRenderEmpty}>
          <Search
            className="w-1/2 mb-4"
            placeholder="Search by role name"
            value={searchQuery}
            onChange={handleSearch}
          />
          <ResponsiveTable
            loading={loading}
            dataSource={filteredData}
            columns={[
              {
                title: 'Role name',
                dataIndex: 'name',
                key: 'name',
                render: (text: string, record: RoleWithUser) => <Link href={`/roles/${record.id}`}>{text}</Link>,
              },
              {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
              },
              {
                title: 'Created by',
                dataIndex: 'createdBy',
                key: 'createdBy',
                render: (text: string, record: RoleWithUser) => (
                  <User userId={record.createdBy} user={record.createdByUser} />
                ),
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
                    danger
                    type="link"
                    onClick={() =>
                      Modal.confirm({
                        title: 'Confirm',
                        okText: 'Remove',
                        content: (
                          <>
                            Are you sure you want to remove category <strong>{category.name}</strong> from role{' '}
                            <strong>{record.name}</strong>?
                          </>
                        ),
                        onOk: () => handleRemoveRole(record),
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
        type="role"
        category={category}
        isModalOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default RolesInSelectedCategory;
