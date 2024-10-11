import React, { ReactNode } from 'react';
import { Breadcrumb, Layout, Menu, theme, Typography } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

import { useAccount } from '@/contexts/AccountContext';
import LoggedUser from '@/components/LoggedUser';
import type { HBUser } from '@/types';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

type LayoutProps = {
  children: ReactNode;
  user: HBUser;
};

type NavigationItem = {
  key: string;
  label?: JSX.Element;
  breadcrumb: string;
  items?: NavigationItem[];
};

const AppLayout: React.FC<LayoutProps> = ({ children, user }) => {
  const router = useRouter();
  const { accountId, permissions } = useAccount();
  const {
    token: { colorBgContainer, colorBorderSecondary },
  } = theme.useToken();

  const hasPermission = (permission: string) => {
    return permissions?.includes(permission);
  };

  const navigationItems: NavigationItem[] = [
    {
      key: 'requests',
      label: <Link href="/requests">Requests</Link>,
      breadcrumb: 'Requests',
      items: [],
    },
    {
      key: 'roles',
      label: <Link href="/roles">Roles</Link>,
      breadcrumb: 'Roles',
      items: [
        { key: 'new', breadcrumb: 'New role' },
        { key: 'edit', breadcrumb: 'Edit role' },
        { key: '[roleId]', breadcrumb: 'Role' },
      ],
    },
    ...(hasPermission('RBAC:PERMISSION:CREATE')
      ? [
          {
            key: 'permissions',
            label: <Link href="/permissions">Permissions</Link>,
            breadcrumb: 'Permissions',
            items: [
              { key: 'new', breadcrumb: 'New permission' },
              { key: 'edit', breadcrumb: 'Edit permission' },
              { key: '[permissionId]', breadcrumb: 'Permission detail' },
            ],
          },
        ]
      : []),
    ...(hasPermission('RBAC:CATEGORY:CREATE')
      ? [
          {
            key: 'categories',
            label: <Link href="/categories">Categories</Link>,
            breadcrumb: 'Categories',
            items: [
              { key: 'new', breadcrumb: 'New category' },
              { key: 'edit', breadcrumb: 'Edit category' },
              { key: '[categoryId]', breadcrumb: 'Category detail' },
            ],
          },
        ]
      : []),
    ...(hasPermission('RBAC:ROLE:CREATE')
      ? [
          {
            key: 'users',
            label: <Link href="/users">Users</Link>,
            breadcrumb: 'Users',
          },
        ]
      : []),
    ...(hasPermission('RBAC:SCOPE_TYPE:CREATE')
      ? [
          {
            key: 'scope_types',
            label: <Link href="/scope_types">Scope types</Link>,
            breadcrumb: 'Scope types',
            items: [
              { key: 'new', breadcrumb: 'New scope type' },
              { key: 'edit', breadcrumb: 'Edit scope type' },
              { key: '[scopeType]', breadcrumb: 'Scope type detail' },
            ],
          },
        ]
      : []),
      ...(hasPermission('RBAC:PERMISSION:CREATE') || hasPermission('RBAC:ROLE_ASSIGNMENT:CREATE')
      ? [
          {
            key: 'audit',
            label: <Link href="/audit">Audit log</Link>,
            breadcrumb: 'Audit log',
          },
        ]
      : []),
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
          zIndex: 99,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: colorBgContainer,
          borderBottom: `1px solid ${colorBorderSecondary}`,
          padding: '0 16px',
        }}
      >
        <Link href="/" className="flex items-center">
          <Image src="/images/groupon_merchant_logo.svg" width="32" height="24" alt="RBAC" />
          <Title level={5} className="p-2 !m-0 hidden md:block">
            RBAC
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
        {accountId ? <LoggedUser user={user} userId={accountId} /> : <p>No user</p>}
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
};

export default AppLayout;
