import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { theme, Layout, Typography, Menu, Breadcrumb } from 'antd';

type LayoutProps = {
  children: ReactNode;
  username: string;
  userId: string;
};

type NavigationItem = {
  key: string;
  label?: JSX.Element;
  breadcrumb: string;
  items?: NavigationItem[];
};

function AppLayout({ children, username }: LayoutProps) {
  const router = useRouter();
  const { Header, Content, Footer } = Layout;
  const { Title } = Typography;

  const {
    token: { colorBgContainer, colorBorderSecondary },
  } = theme.useToken();

  const navigationItems: NavigationItem[] = [
    {
      key: 'homepage',
      label: <Link href="/">Homepage</Link>,
      breadcrumb: 'Homepage',
      items: [],
    },
    {
      key: 'stories',
      label: <Link href="/stories">Stories</Link>,
      breadcrumb: 'Stories',
      items: [
        { key: 'new', breadcrumb: 'New story' },
        { key: 'edit', breadcrumb: 'Edit story' },
        { key: '[id]', breadcrumb: 'Story' },
      ],
    },
  ];

  const findNavigationItem = (keys: string[], items: NavigationItem[]): NavigationItem | null => {
    for (const item of items) {
      if (item.key === keys[0]) {
        if (keys.length === 1) {
          return item;
        }
        if (item.items) {
          return findNavigationItem(keys.slice(1), item.items) || item;
        }
      }
    }
    return null;
  };

  const getBreadcrumbItems = (pathname: string) => {
    const pathSegments = pathname.split('/').filter((segment) => segment);
    if (pathSegments.length === 1) return [];

    const breadcrumbItems = [];
    let currentItems = navigationItems;
    let currentPath = '';

    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      const item = findNavigationItem([segment], currentItems);

      if (item) {
        breadcrumbItems.push({
          title: currentPath !== router.pathname ? <Link href={currentPath}>{item.breadcrumb}</Link> : item.breadcrumb,
        });
        currentItems = item.items || [];
      } else {
        breadcrumbItems.push({
          title: segment,
        });
      }
    }
    return breadcrumbItems;
  };

  const breadcrumbItems = getBreadcrumbItems(router.pathname);

  const findMenuItemKey = (pathname: string): string => {
    const pathSegments = pathname.split('/').filter((segment) => segment);
    return pathSegments[0] || '';
  };

  const selectedKey = findMenuItemKey(router.pathname);

  return (
    <Layout
      style={{
        minHeight: '100vh',
        display: 'flex',
        margin: '0 auto',
        maxWidth: 1200,
        alignSelf: 'center',
        flexDirection: 'column',
      }}
    >
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: colorBgContainer,
          borderBottom: `1px solid ${colorBorderSecondary}`,
          padding: '0 16px',
        }}
      >
        <Link href="/" className="flex items-center">
          <Title level={5} className="p-2 !m-0 hidden md:block">
            GA
          </Title>
        </Link>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={navigationItems.map((item) => ({
            key: item.key,
            label: item.label,
          }))}
          style={{ flex: 1, minWidth: 0, padding: '0 16px' }}
        />
        <p>{username}</p>
      </Header>
      <Content
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '0 16px',
        }}
      >
        <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />
        <div
          style={{
            flex: 1,
          }}
        >
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        &copy;{new Date().getFullYear()} Groupon, Inc. All Rights Reserved.
      </Footer>
    </Layout>
  );
}

export default AppLayout;
