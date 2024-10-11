import { Card, Typography } from 'antd';
import RoleTitle from '@/components/typography/RoleTitle';
import type { OwnerRoleRequest } from '@/types';
import User from '@/components/User';

const { Text, Paragraph } = Typography;

type RoleRequestCardProps = {
  role: OwnerRoleRequest;
};

const RoleRequestCard = ({ role }: RoleRequestCardProps) => {
  return (
    <Card data-testid="role-request-card" title="Request" size="small">
      <section className="mb-4">
        <Paragraph className="!my-0">For role:</Paragraph>
        <RoleTitle>{role.name}</RoleTitle>
        <Text>{role.description}</Text>
      </section>
      <section className="mb-4">
        <Text>From:</Text>
        <User twolines={true} show="both" userId={role.requesterId} user={role.requestedBy} />
      </section>
      <section className="mb-4">
        <Paragraph className="!my-0">Region:</Paragraph>
        <Text>{role.region}</Text>
      </section>
      <section className="mb-4">
        <Paragraph className="!my-0">Scope type:</Paragraph>
        <Text>{role.scopeType}</Text>
      </section>
      {role.scopeValue && (
        <section className="mb-4">
          <Paragraph className="!my-0">Scope value:</Paragraph>
          <Text>{role.scopeValue}</Text>
        </section>
      )}
      <section>
        <Paragraph className="!my-0">Reason:</Paragraph>
        <Text>{role.requesterComment}</Text>
      </section>
    </Card>
  );
};

export default RoleRequestCard;
