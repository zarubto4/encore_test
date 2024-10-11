import { Card, Typography } from 'antd';
import RoleTitle from '@/components/typography/RoleTitle';
import type { RolesResponse } from 'libs/rbac-client/src';
import type { RoleWithUser } from '@/types';

const { Text } = Typography;

type RoleCardProps = {
  role: RolesResponse | RoleWithUser;
};

const RoleCard = ({ role }: RoleCardProps) => {
  return (
    <Card data-testid="role-card" size="small">
      <RoleTitle>{role.name}</RoleTitle>
      <Text data-testid="role-card-description">{role.description}</Text>
    </Card>
  );
};

export default RoleCard;
