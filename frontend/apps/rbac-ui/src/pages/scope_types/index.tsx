import { NextPage } from 'next';
import { Button, Flex, Tag, Typography, Alert } from 'antd';
import Link from 'next/link';

import Head from '@/components/Head';
import User from '@/components/User';
import ResponsiveTable from '@/components/ResponsiveTable';
import { handleError } from '@/utils';
import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';
import useFetchScopeTypes from '@/hooks/useFetchScopeTypes';

import type { ScopeTypeWithUser } from '@/types';

const { Title } = Typography;

const Page: NextPage = () => {
  const { hasPermission } = usePermission();
  const { data, loading, error } = useFetchScopeTypes();

  if (!hasPermission('RBAC:SCOPE_TYPE:CREATE')) {
    return <Alert message="Error" description="Unauthorized" type="error" showIcon />;
  }

  return (
    <>
      <Head title="Scope types" />
      <main>
        <Flex gap="middle" justify="space-between">
          <Title level={2} className="my-0">
            Scope types
          </Title>
          <Link href="/scope_types/new">
            <Button type="primary">Create new scope type</Button>
          </Link>
        </Flex>
        {error && <Alert message="Error" description={handleError(error)} type="error" showIcon />}
        {!error && (
          <ResponsiveTable
            loading={loading}
            dataSource={data}
            columns={[
              {
                title: 'Scope type',
                dataIndex: 'scopeType',
                key: 'scopeType',
                render: (text: string, record: ScopeTypeWithUser) => (
                  <Link href={`/scope_types/${record.scopeType}`}>
                    <Tag color="blue">{text}</Tag>
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
                render: (_, record: ScopeTypeWithUser) => (
                  <User userId={record.createdBy} user={record.createdByUser} />
                ),
              },
            ]}
          />
        )}
      </main>
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
