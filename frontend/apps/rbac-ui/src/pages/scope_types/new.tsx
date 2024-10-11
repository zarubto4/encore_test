import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Alert, message } from 'antd';

import Head from '@/components/Head';
import ScopeTypeForm from '@/components/ScopeTypeForm';
import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';

const Page: NextPage = () => {
  const { hasPermission } = usePermission();
  const router = useRouter();
  const handleSuccessfulSubmit = () => {
    message.success('Scope type created successfully');
    router.push('/scope_types');
  };

  if (!hasPermission('RBAC:CATEGORY:CREATE')) {
    return <Alert message="Error" description="Unauthorized" type="error" showIcon />;
  }

  return (
    <>
      <Head title="New category" />
      <main>
        <ScopeTypeForm type="new" onSuccessfulSubmit={handleSuccessfulSubmit} />
      </main>
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
