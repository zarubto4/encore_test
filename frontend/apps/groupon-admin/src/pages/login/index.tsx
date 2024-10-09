import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { Flex } from 'antd';

import CleanLayout from '@/components/CleanLayout';
import Head from '@/components/Head';
import LoginForm from '@/components/LoginForm';

import type { NextPageWithLayout } from '@/pages/_app';
import { GetServerSideProps } from 'next';
import { AUTH_COOKIE_NAME } from '@/constants';

const LoginPage: NextPageWithLayout<{ email?: string, domain?: string }> = ({ email, domain }) => {
  const router = useRouter();
  const { returnPath = '/' } = router.query;

  return (
    <>
      <Head title="Login" />
      <Flex
        style={{ height: '100vh' }}
        justify="center"
        align="center"
        gap="middle"
      >
        <LoginForm email={email} domain={domain} returnPath={returnPath as string} />
      </Flex>
    </>
  );
};

LoginPage.getLayout = (page: ReactElement) => {
  return <CleanLayout>{page}</CleanLayout>;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const userCookie = ctx.req.cookies[AUTH_COOKIE_NAME];
  const { email = '', domain = '' } = userCookie ? JSON.parse(userCookie) : {};

  // Only allow access to this page in local development
  if (process.env.NEXT_PUBLIC_ENV !== 'local') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      email,
      domain,
    },
  };
};

export default LoginPage;
