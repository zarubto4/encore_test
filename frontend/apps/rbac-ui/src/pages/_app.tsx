import { useEffect, useRef, type ReactElement, type ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps, AppContext } from 'next/app';
import App from 'next/app';
import { ConfigProvider } from 'antd';
import markerSDK from '@marker.io/browser';

import './styles.css';
import AppLayout from '@/components/AppLayout';
import theme from '@/theme/themeConfig';
import { AccountProvider } from '@/contexts/AccountContext';
import { PermissionFactory } from '@/lib/Permission';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { RBAC_USER_ID_HEADER, MARKER_PROJECT_ID } from '@/constants';
import logger from '@/lib/Logger/client';
import { fixEncoding, handleError } from '@/utils';
import type { UserData, HBUser } from '@/types';

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  initialAccountId: string | null;
  initialPermissions: string[];
  grpnBuildVersion: string | null;
  user: HBUser;
};

const MyApp = ({
  Component,
  pageProps,
  initialAccountId,
  initialPermissions,
  router,
  grpnBuildVersion,
  user,
}: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => <AppLayout user={user}>{page}</AppLayout>);

  const userDataRef = useRef<UserData | null>(null);

  useEffect(() => {
    const applicationName = 'rbac-ui';
    const gitRepo = `https://github.groupondev.com/sox-inscope/b2b-ui/commit/`;
    const commitSha = grpnBuildVersion;
    const build = commitSha ? `${gitRepo}${commitSha}` : 'unknown';

    async function fetchUserData() {
      if (userDataRef.current) return;
      try {
        if (initialAccountId) {
          const response = await fetch(`/api/users/${initialAccountId}?show=full`);
          if (!response.ok) {
            const { message } = await response.json();
            throw new Error(message);
          }
          userDataRef.current = await response.json();
        }

        markerSDK.loadWidget({
          project: MARKER_PROJECT_ID,
          reporter: {
            email: userDataRef?.current?.email || 'unknown',
            fullName:
              (userDataRef?.current?.firstName &&
                userDataRef?.current?.lastName &&
                `${userDataRef.current.firstName} ${userDataRef.current.lastName}`) ||
              'unknown',
          },
          customData: {
            meta1: `$$$${JSON.stringify({
              build,
              applicationName,
              type: 'B2B',
            })}$$$`,
            meta2: `$$$${JSON.stringify({
              user: userDataRef.current,
            })}$$$`,
          },
        });
      } catch (error) {
        logger()
          .crit(`Failed to init marker.io for userId:#${initialAccountId}, details:${handleError(error)}`)
          .write();
      }
    }
    fetchUserData();
  }, [initialAccountId, grpnBuildVersion]);

  return (
    <ErrorBoundary>
      <AccountProvider initialAccountId={initialAccountId ?? ''} initialPermissions={initialPermissions}>
        <ConfigProvider theme={theme}>
          {getLayout(
            <AnimatePresence mode="wait">
              <PageTransition key={router.route}>
                <Component {...pageProps} />
              </PageTransition>
            </AnimatePresence>,
          )}
        </ConfigProvider>
      </AccountProvider>
    </ErrorBoundary>
  );
};

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  const req = appContext.ctx.req;
  const initialAccountId = req?.headers[RBAC_USER_ID_HEADER] || null;
  const grpnBuildVersion = process.env.grpn_appSha || null;
  const firstName = (req?.headers['HB_USER_FIRST_NAME'] as string) || null;
  const lastName = (req?.headers['HB_USER_FIRST_NAME'] as string) || null;
  const email = req?.headers['HB_USER_EMAIL'] || null;

  if (!initialAccountId) {
    return { ...appProps };
  }

  const initialStrategy = await PermissionFactory.createPermissionStrategy(initialAccountId as string);

  return {
    ...appProps,
    initialAccountId,
    grpnBuildVersion,
    initialPermissions: initialStrategy.getPermissions(),
    user: {
      firstName: firstName ? fixEncoding(firstName) : null,
      lastName: lastName ? fixEncoding(lastName) : null,
      email,
    },
  };
};

export default MyApp;
