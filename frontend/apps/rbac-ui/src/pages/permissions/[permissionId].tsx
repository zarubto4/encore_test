import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Alert, Spin, message } from 'antd';

import Head from '@/components/Head';

import useFetchPermission from '@/hooks/useFetchPermission';
import PermissionsForm from '@/components/PermissionsForm';
import RolesWithPermission from '@/components/RolesWithPermission';
import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';

const Page: NextPage = () => {
  const { hasPermission } = usePermission();
  const router = useRouter();

  const handleSuccessfulSubmit = () => {
    message.success('Permission updated successfully');
    router.push('/permissions');
  };

  const handelDismiss = () => {
    router.push('/permissions');
  };

  const { permissionId } = router.query;
  const { data: permission, loading, error } = useFetchPermission(permissionId as string);

  if (!hasPermission('RBAC:PERMISSION:CREATE')) {
    return <Alert message="Error" description="Unauthorized" type="error" showIcon />;
  }

  return (
    <>
      <Head title={permission?.code ?? 'Permission detail'} />
      {loading && <Spin />}
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {permission && (
        <>
          <PermissionsForm
            permission={permission}
            onSuccessfulSubmit={handleSuccessfulSubmit}
            onDismiss={handelDismiss}
          />
          <RolesWithPermission permission={permission} />
        </>
      )}
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
