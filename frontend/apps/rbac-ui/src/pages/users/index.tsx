import { useState } from 'react';
import { NextPage } from 'next';
import { Alert, Flex, Radio, RadioChangeEvent, Typography } from 'antd';

import Head from '@/components/Head';
import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';
import SelectUser from '@/components/SelectUser';
import useFetchUserByEmails from '@/hooks/useFetchUserByEmails';
import RolesTableUser from '@/components/RolesTableUser';
import { USER_REGION_SELECT } from '@/constants';
import { UserRegionType } from 'libs/users-client/src';

const Page: NextPage = () => {
  const { hasPermission } = usePermission();
  const [userEmails, setUserEmails] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<UserRegionType>(USER_REGION_SELECT[0]);
  const { data: resolvedUsers, error } = useFetchUserByEmails(userEmails, selectedRegion);
  const { Title } = Typography;
  const PAGE_TITLE = 'Roles for users';
  
  const handleUsersChange = (emails: string[]) => {
    setUserEmails(emails);
  };

  const handleRegionChange = (e: RadioChangeEvent) => {
    setSelectedRegion(e.target.value);
  };

  if (!hasPermission('RBAC:ROLE:CREATE')) {
    return <Alert message="Error" description="Unauthorized" type="error" showIcon />;
  }

  return (
    <>
      <Head title={PAGE_TITLE} />
      <main>
        <Title level={2} className="my-0">
          {PAGE_TITLE}
        </Title>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-4">
          <Radio.Group defaultValue={USER_REGION_SELECT[0]} onChange={handleRegionChange} options={USER_REGION_SELECT} />
          <SelectUser onUsersChange={handleUsersChange} />
        </div>
        {error && <Alert className="my-4" message="Error" description={error} type="error" showIcon />}
        {!error && resolvedUsers.map((user) => <RolesTableUser key={user.id} user={user} />)}
      </main>
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
