import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Typography, Alert, Button, Tag, Input, Spin, TableProps } from 'antd';

import useFetchRoles from '@/hooks/useFetchRoles';
import ResponsiveTable from '@/components/ResponsiveTable';
import AssignRoleToUserModal from '@/components/AssignRoleToUserModal';
import User from '@/components/User';
import SelectCategories from '@/components/SelectCategories';
import RoleRequestModal from '@/components/RoleRequestModal';
import { categoriesAsArray } from '@/utils';
import { type RoleWithUser, UserEnum } from '@/types';

const { Title } = Typography;
const { Search } = Input;

type RolesTableAllProps = {
  myRolesIds?: string[];
  type?: UserEnum;
};

let debounceSearchTimer: NodeJS.Timeout | null = null;

const RolesTableAll = ({ myRolesIds, type = UserEnum.USER }: RolesTableAllProps) => {
  const router = useRouter();
  const page = parseInt(router.query.page as string, 10) || 1;
  const pageSize = parseInt(router.query.pageSize as string, 10) || 10;
  
  const [selectedRole, setSelectedRole] = useState<RoleWithUser | null>(null);
  const [isAssignRoleToUserModalOpen, setIsAssignRoleToUserModalOpen] = useState(false);
  const [isRequestRoleModalOpen, setIsRequestRoleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState((router.query.search as string) ?? '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoriesAsArray(router.query.categories));
  const { data, loading, error, pagination } = useFetchRoles({
    page,
    pageSize,
    search: searchDebounce,
    categories: selectedCategories,
  });

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

  const handleModal = (role: RoleWithUser) => {
    setSelectedRole(role);
    if (type === UserEnum.ADMIN) {
      setIsAssignRoleToUserModalOpen(true);
    } else {
      setIsRequestRoleModalOpen(true);
    }
  };

  const handleCancel = () => {
    if (isRequestRoleModalOpen) {
      setIsRequestRoleModalOpen(false);
    } else {
      setIsAssignRoleToUserModalOpen(false);
    }
    setSelectedRole(null);
  };

  const handleSuccess = () => {
    setIsAssignRoleToUserModalOpen(false);
    setSelectedRole(null);
    router.reload();
  };

  const handleSuccessRoleRequest = () => {
    setIsAssignRoleToUserModalOpen(false);
    setSelectedRole(null);
    router.push('/requests');
  }

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

  const handleTableOnChange: TableProps['onChange'] = (pagination) => {
    router.push({
      query: {
        ...router.query,
        page: pagination.current,
        pageSize: pagination.pageSize,
      },
    });
  };

  const resolveActionButtons = (role: RoleWithUser) => {
    if (!myRolesIds) return <Spin />;
    if (type === UserEnum.ADMIN) {
      return (
        <Button onClick={() => handleModal(role)} type="link">
          Assign
        </Button>
      );
    }
    if (type === UserEnum.USER) {
      const isRoleAssigned = myRolesIds.includes(role.id);
      return (
        <Button onClick={() => handleModal(role)} type="link" disabled={isRoleAssigned}>
          Request
        </Button>
      );
    }
  };

  return (
    <>
      <Title level={3}>All roles</Title>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-4">
        <Search allowClear placeholder="Search by role name" value={searchQuery} onChange={handleSearch} />
        <SelectCategories
          initialCategories={selectedCategories}
          onCategoriesChange={handleCategoriesChange}
          placeholder="Filter by categories"
        />
      </div>
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {!error && (
        <>
          <ResponsiveTable
            pagination={{
              pageSize: pagination?.pageSize,
              current: pagination?.page,
              total: pagination?.total,
            }}
            rowCount={pagination?.pageSize}
            onChange={handleTableOnChange}
            loading={loading}
            dataSource={data ?? []}
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
                title: 'Region',
                dataIndex: 'region',
                key: 'region',
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
                  categories.map((category) => {
                    if (type === UserEnum.ADMIN) {
                      return (
                        <Link key={category.id} href={`/categories/${category.id}`}>
                          <Tag style={{ cursor: 'pointer' }} color="blue">
                            {category.name}
                          </Tag>
                        </Link>
                      );
                    }
                    return (
                      <Tag color="blue" key={category.id}>
                        {category.name}
                      </Tag>
                    );
                  }),
              },
              {
                title: 'Actions',
                key: 'action',
                render: (_, role: RoleWithUser) => resolveActionButtons(role),
              },
            ]}
          />
          <AssignRoleToUserModal
            role={selectedRole}
            isModalOpen={isAssignRoleToUserModalOpen}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
          <RoleRequestModal
            role={selectedRole}
            isModalOpen={isRequestRoleModalOpen}
            onSuccess={handleSuccessRoleRequest}
            onCancel={handleCancel}
          />
        </>
      )}
    </>
  );
};

export default RolesTableAll;
