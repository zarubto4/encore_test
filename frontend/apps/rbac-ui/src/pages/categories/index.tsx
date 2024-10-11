import { NextPage } from 'next';
import Link from 'next/link';
import { Button, Flex, Tag, Typography, message, Input, Alert } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import useFetchCategories from '@/hooks/useFetchCategories';
import Head from '@/components/Head';
import DeleteButton from '@/components/DeleteButton';
import User from '@/components/User';
import ResponsiveTable from '@/components/ResponsiveTable';
import { handleError } from '@/utils';
import { deleteCategory } from '@/components/CategoryForm';
import { ShortenText } from '@/components/ShortenText';
import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';

import type { CategoriesWithUser } from '@/types';

const { Title } = Typography;
const { Search } = Input;

const Page: NextPage = () => {
  const { hasPermission } = usePermission();
  const { data, loading } = useFetchCategories();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();

  const processDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await deleteCategory(id);
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      message.success('Category deleted successfully');
      router.reload();
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    } finally {
      setIsLoading(false);
    }
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

  const colums: ColumnsType = [
    {
      title: 'Category name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CategoriesWithUser) => (
        <Link href={`/categories/${record.id}`}>
          <Tag color="blue">
            <ShortenText text={text} />
          </Tag>
        </Link>
      ),
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
      render: (_, record: CategoriesWithUser) => <User userId={record.createdBy} user={record.createdByUser} />,
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text: string, record: CategoriesWithUser) => (
        <DeleteButton category={record} loading={isLoading} onOk={() => processDelete(record.id)} />
      ),
    },
  ];

  if (!hasPermission('RBAC:CATEGORY:CREATE')) {
    return <Alert message="Error" description="Unauthorized" type="error" showIcon />;
  }

  return (
    <>
      <Head title="Categories" />
      <main>
        <Flex gap="middle" justify="space-between">
          <Title level={2} className="my-0">
            Categories
          </Title>
          <Link href="/categories/new">
            <Button type="primary">Create new category</Button>
          </Link>
        </Flex>
        <Search className="my-4" placeholder="Search category name" value={searchQuery} onChange={handleSearch} />
        <ResponsiveTable loading={loading} dataSource={filteredData} columns={colums} />
      </main>
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
