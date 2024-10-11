import { ReactElement, useState } from 'react';
import { useRouter } from 'next/router';
import { Flex, Button, Form, Input, message } from 'antd';
import { GetServerSideProps } from 'next';

import { handleError, setCookie } from '@/utils';
import CleanLayout from '@/components/CleanLayout';
import Head from '@/components/Head';
import { HB_USER_EMAIL } from '@/constants';

import type { FormProps } from 'antd';
import type { NextPageWithLayout } from '@/pages/_app';
import { resolveUserByEmailForRegion } from '@/lib/user';
import { USER_REGION } from 'libs/users-client/src';
import { signToken } from '@/lib/auth';

type FieldType = {
  email?: string;
};

const LoginForm: React.FC<{ returnPath: string; email?: string }> = ({ returnPath, email }) => {
  const [loading, setLoading] = useState(false);

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('/api/login/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          const error = errorData.errors[0];
          if (error.subject === 'request_limit' && error.errorCode === 'exceeded') {
            throw new Error('Rate limit exceeded');
          }
        }
        throw new Error(errorData.message || 'An unexpected error occurred');
      }
      window.location.href = returnPath || '/';
    } catch (error) {
      const errorMessage = handleError(error);
      message.open({
        type: 'error',
        content: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.error(errorInfo);
  };

  return (
    <div style={{ padding: 16, minWidth: 300, maxWidth: 600 }}>
      <h1>Developer login</h1>
      <p>This login page is only for local development.</p>
      <Form
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        initialValues={{ email }}
      >
        <Form.Item<FieldType>
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please enter @groupon.com email' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button block type="primary" htmlType="submit" loading={loading}>
            Log in
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const LoginPage: NextPageWithLayout<{ email?: string }> = ({ email }) => {
  const router = useRouter();
  const { returnPath = '/' } = router.query;

  return (
    <>
      <Head title="Login" />
      <Flex style={{ height: '100vh' }} justify="center" align="center" gap="middle">
        <LoginForm email={email} returnPath={returnPath as string} />
      </Flex>
    </>
  );
};

LoginPage.getLayout = (page: ReactElement) => {
  return <CleanLayout>{page}</CleanLayout>;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const isDevMode = process.env.NEXT_PUBLIC_ENV === 'local';
  const returnPath = ctx.query.returnPath as string;

  if (!isDevMode) {
    const userEmail = ctx.req.headers[HB_USER_EMAIL] ?? null;
    if (!userEmail) {
      console.error('Failed to get user email from HB');
      return {
        redirect: {
          destination: '/error?type=hb-failed',
          permanent: false,
        },
      };
    }

    try {
      const responseNA = await resolveUserByEmailForRegion(userEmail as string, USER_REGION.NA, ctx.req);
      const responseEMEA = await resolveUserByEmailForRegion(userEmail as string, USER_REGION.EMEA, ctx.req);
      if (!responseNA?.user && !responseEMEA?.user) {
        console.error(`Account with email ${userEmail} was not found in any region`);
        return {
          redirect: {
            destination: '/error?type=user-failed-to-resolve',
            permanent: false,
          },
        };
      }

      const maxAge = 60 * 60; // 1 hour
      const token = await signToken({
        ...(responseNA?.user && { NA: responseNA.user }),
        ...(responseEMEA?.user && { EMEA: responseEMEA.user })
      }, maxAge);
      setCookie(ctx.res, token, { maxAge });

      return {
        redirect: {
          destination: returnPath ?? '/',
          permanent: false,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        redirect: {
          destination: '/error?type=unexpected-error',
          permanent: false,
        },
      };
    }

  }

  return {
    props: {},
  };
};

export default LoginPage;
