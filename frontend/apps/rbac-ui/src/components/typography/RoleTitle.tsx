import { ReactNode } from 'react';
import { Typography } from 'antd';
import { blue } from '@ant-design/colors';

const { Title } = Typography;

type RoleTitleProps = {
  level?: 1 | 2 | 3 | 4 | 5;
  children?: ReactNode;
};

const RoleTitle = ({ level = 3, children, ...restProps }: RoleTitleProps) => {
  return (
    <Title data-testid="role-title" level={level} style={{ margin: 0, color: blue.primary }} {...restProps}>
      {children}
    </Title>
  );
};

export default RoleTitle;
