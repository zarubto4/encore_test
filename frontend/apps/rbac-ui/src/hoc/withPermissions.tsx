import { GetServerSidePropsContext, GetServerSideProps } from 'next';

import { PermissionProvider } from '@/contexts/PermissionContext';
import { UserPermissionStrategy, PermissionFactory } from '@/lib/Permission';
import { RBAC_USER_ID_HEADER } from '@/constants';
interface WithPermissionsProps {
  initialPermissions: string[];
}

export function withPermissions<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const ComponentWithPermissions = (props: P & WithPermissionsProps) => {
    const { initialPermissions, ...restProps } = props;

    const initialStrategy = new UserPermissionStrategy(initialPermissions);

    return (
      <PermissionProvider initialStrategy={initialStrategy}>
        <WrappedComponent {...(restProps as P)} />
      </PermissionProvider>
    );
  };

  return ComponentWithPermissions;
}

export const getServerSideProps: GetServerSideProps<WithPermissionsProps> = async (
  context: GetServerSidePropsContext,
) => {
  const userId = context.req.headers[RBAC_USER_ID_HEADER] as string | undefined;
  if (!userId) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const initialStrategy = await PermissionFactory.createPermissionStrategy(userId);

  return {
    props: {
      initialPermissions: initialStrategy.getPermissions(),
    },
  };
};
