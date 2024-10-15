import router from 'next/router';
import { useCallback, useState } from 'react';
import { NextPage } from 'next';
import { Button, Flex, Space, Typography } from 'antd';
import Link from 'next/link';

import Head from '@/components/Head';
import AssignRoleToUserModal from '@/components/AssignRoleToUserModal';
import RolesTableAll from '@/components/RolesTableAll';
import RolesTableMy from '@/components/RolesTableMy';
import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';
import RoleRequestModal from '@/components/RoleRequestModal';

import type { RolesResponse } from '@vpcs/rbac-client';
import { UserEnum } from '@/types';

const Page: NextPage = () => {
  const [selectedRole, setSelectedRole] = useState<RolesResponse | null>(null);
  const [isAssisngModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [myRolesIds, setMyRolesIds] = useState<string[]>([]);
  const { hasPermission } = usePermission();

  const userType = hasPermission('RBAC:ROLE:CREATE') ? UserEnum.ADMIN : UserEnum.USER;
  const { Title } = Typography;

  const handleCancel = () => {
    if (isRequestModalOpen) {
      setIsRequestModalOpen(false);
    } else {
      setIsAssignModalOpen(false);
    }
    setSelectedRole(null);
  };

  const handleSuccess = () => {
    if (isRequestModalOpen) {
      setIsRequestModalOpen(false);
    } else {
      setIsAssignModalOpen(false);
    }
    setSelectedRole(null);
    router.reload();
  };

  const handleSuccessRequest = () => {
    setIsRequestModalOpen(false);
    setSelectedRole(null);
    router.push('/requests');
  }

  const handleMyRolesLoaded = useCallback((ids: string[]) => {
    setMyRolesIds(ids);
  }, []);

  return (
    <>
      <Head title="Roles" />
      <main>
        <Flex gap="middle" justify="space-between">
          <Title level={2} className="my-0">
            Roles
          </Title>
          <Space>
            {userType === UserEnum.ADMIN && (
              <>
                <Link href="/roles/new">
                  <Button type="primary">Create new role</Button>
                </Link>
                <Button onClick={() => setIsAssignModalOpen(true)}>Assign roles</Button>
              </>
            )}
            {userType === UserEnum.USER && (
              <Button type="primary" onClick={() => setIsRequestModalOpen(true)}>
                Request roles
              </Button>
            )}
          </Space>
        </Flex>
        {userType === UserEnum.ADMIN && (
          <>
            <RolesTableAll type={userType} myRolesIds={myRolesIds} />
            <RolesTableMy myRolesLoaded={handleMyRolesLoaded} />
            <AssignRoleToUserModal
              role={selectedRole}
              myRolesIds={myRolesIds}
              isModalOpen={isAssisngModalOpen}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </>
        )}
        {userType === UserEnum.USER && (
          <>
            <RolesTableMy myRolesLoaded={handleMyRolesLoaded} />
            <RolesTableAll type={userType} myRolesIds={myRolesIds} />
            <RoleRequestModal
              role={selectedRole}
              myRolesIds={myRolesIds}
              isModalOpen={isRequestModalOpen}
              onSuccess={handleSuccessRequest}
              onCancel={handleCancel}
            />
          </>
        )}
      </main>
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
