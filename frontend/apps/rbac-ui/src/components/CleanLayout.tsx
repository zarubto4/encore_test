import { ReactNode } from 'react';
import { Layout } from 'antd';

type CustomLayoutProps = {
  children: ReactNode;
};

const CustomLayout = ({ children }: CustomLayoutProps) => {
  return <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} data-testid="layout-container">{children}</Layout>;
};

export default CustomLayout;
