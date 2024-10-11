import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Alert, Spin, message } from 'antd';
import { motion } from 'framer-motion';

import useFetchRole from '@/hooks/useFetchRole';
import Head from '@/components/Head';
import RoleForm from '@/components/RoleForm';
import UsersWithRole from '@/components/UsersWithRole';
import AssignedRolePermissions from '@/components/AssignedRolePermissions';
import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';
import RoleOwners from '@/components/RoleOwners';
import { UserEnum } from '@/types';
import useFetchRoleOwners from '@/hooks/useFetchRoleOwners';
import { useAccount } from '@/contexts/AccountContext';

const Page: NextPage = () => {
  const router = useRouter();
  const { accountId } = useAccount();
  const { roleId } = router.query;
  const { data: role, loading, error } = useFetchRole(roleId as string);
  const { data: owners, loading: ownersLoading, error: ownersError } = useFetchRoleOwners(roleId as string, 0);
  const { hasPermission } = usePermission();

  const isUserOwner = owners?.some((owner) => owner.ownerId === accountId);

  const userType = hasPermission('RBAC:ROLE:CREATE') ? UserEnum.ADMIN : isUserOwner ? UserEnum.OWNER : UserEnum.USER;

  const handleSuccessfullSubmit = () => {
    message.success('Role updated successfully');
    router.reload();
  };

  const handleSuccessfullDelete = () => {
    message.success('Role deleted successfully');
    router.push('/roles');
  };

  const handleAssignedPermission = () => {
    message.success('Permission assigned successfully');
    router.reload();
  };

  const handleRevokePermission = () => {
    message.success('Permission revoked successfully');
    router.reload();
  };

  return (
    <>
      <Head title={role?.name ?? 'Role detail'} />
      {loading && <Spin />}
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {role && (
        <motion.div
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -5 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <RoleForm
            disabled={userType !== UserEnum.ADMIN}
            role={role}
            onSuccessfulSubmit={handleSuccessfullSubmit}
            onSuccessfulDelete={handleSuccessfullDelete}
          >
            <RoleOwners
              owners={owners}
              loading={ownersLoading}
              error={ownersError}
              disabled={userType === UserEnum.USER}
              role={role}
            />
          </RoleForm>
          {userType !== UserEnum.USER && <UsersWithRole role={role} />}
          <AssignedRolePermissions
            disabled={userType !== UserEnum.ADMIN}
            onRevokePermission={handleRevokePermission}
            onAssignedPermission={handleAssignedPermission}
            role={role}
          />
        </motion.div>
      )}
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
