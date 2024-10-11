import Link from 'next/link';
import { NextPage } from 'next';
import { Button, Flex, Space, Typography, message, Tag, Alert, Input, TableProps } from 'antd';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Head from '@/components/Head';
import ResponsiveTable from '@/components/ResponsiveTable';
import DeleteButton from '@/components/DeleteButton';
import useFetchPermissions from '@/hooks/useFetchPermissions';
import User from '@/components/User';
import SelectCategories from '@/components/SelectCategories';
import AssignPermisssionToRoleModal from '@/components/AssignPermisssionToRoleModal';
import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';
import { categoriesAsArray } from '@/utils';

import type { PermissionWithUser } from '@/types';

const { Title } = Typography;
const { Search } = Input;

let debounceSearchTimer: NodeJS.Timeout | null = null;

const Page: NextPage = () => {
  const router = useRouter();
  const page = parseInt(router.query.page as string, 10) || 1;
  const pageSize = parseInt(router.query.pageSize as string, 10) || 10;

  const { hasPermission } = usePermission();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState((router.query.search as string) ?? '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoriesAsArray(router.query.categories));
  const { data, loading, error, pagination } = useFetchPermissions({
    page,
    pageSize,
    search: searchDebounce,
    categories: selectedCategories,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRoleAssignModalOpen, setIsRoleAssignModalOpen] = useState<boolean>(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionWithUser | null>(null);

  useEffect(() => {
    const { categories = [], search = '' } = router.query;
    
    const currentCategories = categoriesAsArray(categories);
    const currentSearch = search as string;
  
    if (currentSearch !== searchDebounce) {
      setSearchDebounce(currentSearch);
      setSearchQuery(currentSearch);
    }
  
    if (JSON.stringify(currentCategories) !== JSON.stringify(selectedCategories)) {
      setSelectedCategories(currentCategories);
    }
  }, [router.query, searchDebounce, selectedCategories]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    if (debounceSearchTimer) {
      clearTimeout(debounceSearchTimer);
      debounceSearchTimer = null;
    }
    debounceSearchTimer = setTimeout(() => {
      router.push({
        query: {
          ...router.query,
          page: 1,
          search: e.target.value,
        },
      });
    }, 300);
  };

  const handleCategoriesChange = (categories: string[]) => {
    router.push({
      query: {
        ...router.query,
        page: 1,
        categories,
      },
    });
  };

  const handleAssignToRole = (permission: PermissionWithUser) => {
    setSelectedPermission(permission);
    setIsRoleAssignModalOpen(true);
  };

  const handleCancelAssign = () => {
    setIsRoleAssignModalOpen(false);
    setSelectedPermission(null);
  };

  const handleDeletePermission = async (permissionId: string) => {
    try {
      setIsLoading(true);
      const deleteResponse = await fetch(`/api/rbac/permissions/${permissionId}`, {
        method: 'DELETE',
      });
      if (deleteResponse.status == 204) {
        message.success('Permission deleted successfully');
        router.reload();
      } else {
        message.error('Failed to delete Permission');
      }
    } finally {
      setIsLoading(false);
    }
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

  if (!hasPermission('RBAC:PERMISSION:CREATE')) {
    return <Alert message="Error" description="Unauthorized" type="error" showIcon />;
  }

  return (
    <>
      <Head title="Permissions" />
      <main>
        <Flex gap="middle" justify="space-between">
          <Title level={2} className="my-0">
            All permissions
          </Title>
          <Space>
            <Link href="/permissions/new">
              <Button type="primary">Create new permission</Button>
            </Link>
          </Space>
        </Flex>
        {error && <Alert message="Error" description={error} type="error" showIcon />}
        {!error && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-4">
              <Search placeholder="Search by permission code" value={searchQuery} onChange={handleSearch} allowClear />
              <SelectCategories
                initialCategories={selectedCategories}
                onCategoriesChange={handleCategoriesChange}
                placeholder="Filter by categories"
              />
            </div>

            <ResponsiveTable
              rowCount={pagination?.pageSize}
              pagination={{
                pageSize: pagination?.pageSize,
                current: pagination?.page,
                total: pagination?.total,
              }}
              onChange={handleTableOnChange}
              loading={loading}
              dataSource={data ?? []}
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
                  render: (_, record: PermissionWithUser) =>
                    record.categories?.map((category) => (
                      <Link key={category.id} href={`/categories/${category.id}`}>
                        <Tag color="blue">{category.name}</Tag>
                      </Link>
                    )),
                },
                {
                  title: 'Created By',
                  dataIndex: 'createdBy',
                  key: 'createdBy',
                  render: (_, record: PermissionWithUser) => (
                    <User userId={record.createdBy} user={record.createdByUser} />
                  ),
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record: PermissionWithUser) => (
                    <Flex align="center">
                      <Button type="link" onClick={() => handleAssignToRole(record)}>
                        Assign to role
                      </Button>
                      <DeleteButton
                        permission={record}
                        loading={isLoading}
                        onOk={() => handleDeletePermission(record.id)}
                      />
                    </Flex>
                  ),
                },
              ]}
            />
          </>
        )}
        <AssignPermisssionToRoleModal
          permission={selectedPermission}
          isModalOpen={isRoleAssignModalOpen}
          onSuccess={() => setIsRoleAssignModalOpen(false)}
          onCancel={handleCancelAssign}
        />
      </main>
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
