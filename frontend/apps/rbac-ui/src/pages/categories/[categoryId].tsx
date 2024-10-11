import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Alert, Spin, message } from 'antd';

import Head from '@/components/Head';

import CategoryForm from '@/components/CategoryForm';
import PermissionInSelectedCategory from '@/components/PermissionInSelectedCategory';
import RolesInSelectedCategory from '@/components/RolesInSelectedCategory';
import useFetchCategory from '@/hooks/useFetchCategory';
import { withPermissions, getServerSideProps } from '@/hoc/withPermissions';
import { usePermission } from '@/contexts/PermissionContext';

const Page: NextPage = () => {
  const { hasPermission } = usePermission();
  const router = useRouter();
  const { categoryId } = router.query;
  const { data: category, loading, error } = useFetchCategory(categoryId as string);

  const handleSuccessfulSubmit = () => {
    message.success('Category updated successfully');
    router.push('/categories');
  };

  const handleSuccessfullDelete = () => {
    message.success('Category deleted successfully');
    router.push('/categories');
  };

  if (!hasPermission('RBAC:CATEGORY:CREATE')) {
    return <Alert message="Error" description="Unauthorized" type="error" showIcon />;
  }

  return (
    <>
      <Head title={category?.name ?? 'Category detail'} />
      {loading && <Spin />}
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {category && (
        <>
          <CategoryForm
            initialValues={category}
            onSuccessfulSubmit={handleSuccessfulSubmit}
            onSuccessfulDelete={handleSuccessfullDelete}
          />
          <RolesInSelectedCategory category={category} />
          <PermissionInSelectedCategory category={category} />
        </>
      )}
    </>
  );
};

export default withPermissions(Page);
export { getServerSideProps };
