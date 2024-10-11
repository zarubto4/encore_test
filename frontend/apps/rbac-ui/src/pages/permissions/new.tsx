import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Alert, message } from 'antd';

import Head from '@/components/Head';
import PermissionsForm from '@/components/PermissionsForm';
import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';

const Page: NextPage = () => {
  const { hasPermission } = usePermission();
  const router = useRouter();
  const handleSuccessfullSubmit = () => {
    message.success('Permission created successfully');
    router.push('/permissions');
  };

  const handleDismiss = () => {
    router.push('/permissions');
  };

  if (!hasPermission('RBAC:PERMISSION:CREATE')) {
    return <Alert message="Error" description="Unauthorized" type="error" showIcon />;
  }

  return (
    <>
      <Head title="New permission" />
      <main>
        <PermissionsForm onSuccessfulSubmit={handleSuccessfullSubmit} onDismiss={handleDismiss} />
      </main>
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
