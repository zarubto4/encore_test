import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Alert, message } from 'antd';

import Head from '@/components/Head';
import RoleForm from '@/components/RoleForm';
import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';

const Page: NextPage = () => {
  const { hasPermission } = usePermission();
  const router = useRouter();
  const handleSuccessfulSubmit = () => {
    message.success('Role created successfully');
    router.push('/roles');
  };

  if (!hasPermission('RBAC:PERMISSION:CREATE')) {
    return <Alert message="Error" description="Unauthorized" type="error" showIcon />;
  }

  return (
    <>
      <Head title="New role" />
      <main>
        <RoleForm onSuccessfulSubmit={handleSuccessfulSubmit} />
      </main>
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
