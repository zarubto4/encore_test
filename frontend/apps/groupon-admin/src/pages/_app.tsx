import { ConfigProvider } from 'antd';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';

import AppLayout from '@/components/AppLayout';
import theme from '@/theme/themeConfig';
import './styles.css';
import { TRPCReactProvider } from '@/trpc/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
const queryClient = new QueryClient();

function CustomApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ?? ((page) => <AppLayout {...pageProps}>{page}</AppLayout>);
  return (
    <>
      <ConfigProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <TRPCReactProvider>
            {getLayout(
              <Component {...pageProps} />,
            )}
          </TRPCReactProvider>
        </QueryClientProvider>
      </ConfigProvider>
    </>
  );
}

export default CustomApp;
