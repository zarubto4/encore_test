import { Card, Typography } from 'antd';
import RoleTitle from '@/components/typography/RoleTitle';
import type { PermissionsResponse } from 'libs/rbac-client/src';

const { Text } = Typography;

type PermissionCardProps = {
  permission: PermissionsResponse;
};

const PermissionCard = ({ permission }: PermissionCardProps) => {
  return (
    <Card data-testid="permission-card" size="small">
      <RoleTitle>{permission.code}</RoleTitle>
      <Text>{permission.description}</Text>
    </Card>
  );
};

export default PermissionCard;
