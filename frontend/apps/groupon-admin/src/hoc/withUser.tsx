import { GetServerSidePropsContext, GetServerSideProps } from 'next';
import { USER_ID_HEADER, USER_NAME_HEADER } from '@/constants';

interface WithUserProps {
  userId: string;
  username: string;
}

export function withUser<P extends object>(
  WrappedComponent: React.ComponentType<P>,
) {
  const ComponentWithUser = (props: P & WithUserProps) => {
    return <WrappedComponent {...(props as P)} />;
  };
  return ComponentWithUser;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const userId = context.req.headers[USER_ID_HEADER] as string | undefined;
  if (!userId) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const username = context.req.headers[USER_NAME_HEADER] as string | undefined;

  return {
    props: {
      userId,
      username,
    },
  };
};
