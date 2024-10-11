import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import User from '@/components/User';
import type { HBUser } from '@/types';

type LoggedUserProps = {
  userId: string;
  user?: HBUser;
};

const LoggedUser = ({ userId, user }: LoggedUserProps) => {
  const items: MenuProps['items'] = [];
  const isDevMode = process.env.NEXT_PUBLIC_ENV === 'local';

  // logout only in local environment
  if (isDevMode) {
    items.push({
      key: '1',
      label: <a href="/api/login/logout">Logout</a>,
    });
  }

  return (
    <Dropdown menu={{ items }}>
      <Space>
        {userId && <User tooltip={false} userId={userId} user={user?.firstName ? user: undefined} />}
        {isDevMode && <DownOutlined />}
      </Space>
    </Dropdown>
  );
};

export default LoggedUser;
