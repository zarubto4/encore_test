import { useState, useMemo } from 'react';
import { Modal, Form, Button, message, Card, Typography } from 'antd';

import { ScopeType } from 'libs/rbac-client/src';
import { handleError } from '@/utils';
import RoleTitle from '@/components/typography/RoleTitle';
import type { UserRolesCreateResponseWithUser } from '@/types';
import User from '@/components/User';

type RevokeRoleModalProps = {
  onSuccess: () => void;
  onCancel?: () => void;
  isModalOpen: boolean;
  userRole: UserRolesCreateResponseWithUser;
  type: 'my' | 'all';
};

const { Text } = Typography;

type FormFields = {
  scopeType: ScopeType;
  scopeValue: string;
  comment: string;
};

const RevokeRoleModal = ({ onSuccess, onCancel, isModalOpen, userRole, type }: RevokeRoleModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const handleCancel = () => {
    onCancel?.();
  };

  const onFinish = async (values: FormFields) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/rbac/users/roles`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: userRole.roleId,
          userId: userRole.userId,
          scopeType: userRole.scopeType,
          scopeValue: userRole.scopeValue,
        }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      message.success('Role revoked successfully');
      onSuccess?.();
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const initialValues = useMemo(
    () => ({
      comment: '', //This can be used if we add reason field later
    }),
    [],
  );

  return (
    <Modal
      title={type === 'my' ? 'Leave role' : 'Revoke role from user'}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} danger onClick={() => form.submit()}>
          {type === 'my' ? 'Leave role' : 'Revoke'}
        </Button>,
      ]}
    >
      <>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
          className="my-4"
          disabled={loading}
        >
          {userRole && (
            <Card size="small">
              <section className="mb-4">
                <Text>User:</Text>
                <User show="both" twolines userId={userRole.userId} user={userRole.user} />
              </section>
              <section>
                <Text>Role:</Text>
                <RoleTitle>{userRole.role.name}</RoleTitle>
                <Text>{userRole.role.description}</Text>
              </section>
            </Card>
          )}
        </Form>
      </>
    </Modal>
  );
};

export default RevokeRoleModal;
