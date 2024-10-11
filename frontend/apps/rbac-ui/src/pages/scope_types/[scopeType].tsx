import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Alert, Spin, message } from 'antd';

import Head from '@/components/Head';

import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';
import useFetchScopeType from '@/hooks/useFetchScopeType';
import ScopeTypeForm from '@/components/ScopeTypeForm';

const Page: NextPage = () => {
  const { hasPermission } = usePermission();
  const router = useRouter();
  const { scopeType } = router.query;
  const { data: scopeTypeData, loading, error } = useFetchScopeType(scopeType as string);

  const handleSuccessfulSubmit = () => {
    message.success('Scope type updated successfully');
    router.push('/scope_types');
  };

  if (!hasPermission('RBAC:CATEGORY:CREATE')) {
    return <Alert message="Error" description="Unauthorized" type="error" showIcon />;
  }

  return (
    <>
      <Head title={scopeTypeData?.scopeType ?? 'Scope type detail'} />
      {loading && <Spin />}
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {scopeTypeData && (
        <>
          <ScopeTypeForm type="edit" initialValues={scopeTypeData} onSuccessfulSubmit={handleSuccessfulSubmit} />
        </>
      )}
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
