import { useState, useCallback, useMemo, lazy } from 'react';
import { Modal, Typography, Form, Button, message, Input, Checkbox } from 'antd';
import { green, red } from '@ant-design/colors';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

import { ScopeType } from '@vpcs/rbac-client';
import { handleError } from '@/utils';
import { isValidEmail } from '@/utils';
import SelectRoles from '@/components/SelectRoles';
import RoleCard from '@/components/RoleCard';
import SelectUser from '@/components/SelectUser';
import SelectScopeType from '@/components/SelectScopeType';
import { USER_REGION_SELECT } from '@/constants';

import type { RolesResponse } from '@vpcs/rbac-client';
import type { AssignResultType } from '@/types';

type AssignRolesModalProps = {
  onSuccess: () => void;
  onCancel?: () => void;
  isModalOpen: boolean;
  role?: RolesResponse | null;
  myRolesIds?: string[];
};

const { Title, Paragraph } = Typography;

type FormFields = {
  scopeType: ScopeType;
  scopeValue: string;
  comments: string;
  regions: string[];
};

const AssignRoleToUserModal = ({ onSuccess, onCancel, isModalOpen, role, myRolesIds }: AssignRolesModalProps) => {
  const [form] = Form.useForm();
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRoles, setSelectedRoles] = useState<string[] | null>(role?.id ? [role.id] : null);
  const [result, setResult] = useState<AssignResultType | null>(null);
  const [scope, setScope] = useState<ScopeType>('GLOBAL');

  const handleCancel = useCallback(() => {
    setEmails([]);
    setResult(null);
    onCancel?.();
  }, [onCancel]);

  const handleFinish = useCallback(() => {
    if (result?.success.length) {
      onSuccess?.();
    } else {
      onCancel?.();
    }
    setEmails([]);
    setResult(null);
  }, [onCancel, onSuccess, result]);

  const handleRolesChange = useCallback((roles: string[]) => {
    setSelectedRoles(roles);
  }, []);

  const handleEmailChange = useCallback((newEmails: string[]) => {
    setEmails(newEmails.filter(isValidEmail));
  }, []);

  const onFinish = async (values: FormFields) => {
    setLoading(true);
    setResult(null);

    const roles = role ? [role.id] : selectedRoles;

    try {
      const response = await fetch('/api/rbac/users/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles, emails, ...values, scopeType: scope }),
      });
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      const data: AssignResultType = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const initialValues = useMemo(
    () => ({
      scopeType: '',
      scopeValue: '',
      comments: '',
      regions: [USER_REGION_SELECT[0]],
    }),
    [],
  );

  return (
    <Modal
      title={!result ? `Assign ${role ? 'role' : 'roles'} to user` : ''}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={
        !result
          ? [
              <Button key="back" onClick={handleCancel}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                disabled={!emails.length || (!role && !selectedRoles?.length)}
                loading={loading}
                onClick={() => form.submit()}
              >
                Assign {selectedRoles && selectedRoles.length > 1 ? 'roles' : 'role'}
              </Button>,
            ]
          : [
              <Button data-testid="assign-role-to-user-modal-close-button" key="submit" onClick={handleFinish}>
                Close
              </Button>,
            ]
      }
    >
      {!result ? (
        <>
          {role && <RoleCard role={role} />}
          {!role && <SelectRoles mode="multiple" onRolesChange={handleRolesChange} />}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={initialValues}
            className="my-4"
            disabled={loading}
          >
            <Form.Item required label="Add users emails" help="You can paste comma seraparted emails">
              <SelectUser onUsersChange={handleEmailChange} />
            </Form.Item>
            <Form.Item
              name="regions"
              label="Select Region"
              required
              rules={[{ required: true, message: 'Please select at least one region' }]}
            >
              <Checkbox.Group options={USER_REGION_SELECT.map((region) => ({ value: region, label: region }))} />
            </Form.Item>
            <Form.Item name="scopeType" required label="Scope type">
              <SelectScopeType onChange={setScope} />
            </Form.Item>
            {scope !== 'GLOBAL' && (
              <Form.Item
                name="scopeValue"
                required
                label="Scope value"
                rules={[{ required: true, message: 'Please provide scope value' }]}
              >
                <Input showCount maxLength={50} type="text" placeholder="Enter scope value" />
              </Form.Item>
            )}
            <Form.Item name="comments" label="Comment">
              <Input showCount maxLength={100} type="text" placeholder="Describe reason" />
            </Form.Item>
          </Form>
        </>
      ) : (
        <>
          {result.success.length > 0 && (
            <div className="text-center mt-8">
              <CheckCircleOutlined style={{ fontSize: 54, color: green.primary }} />
              <Title level={4}>
                Successfully granted
                {role ? ` role ${role.name} ` : ' roles '}
                to users:
              </Title>
              {result.success.map((user) => (
                <Paragraph className="!my-0" key={user.email}>
                  {user.email} ({user.region})
                </Paragraph>
              ))}
            </div>
          )}
          {result.failed.length > 0 && (
            <div className="text-center mt-8">
              <CloseCircleOutlined style={{ fontSize: 54, color: red.primary }} />
              <Title level={4}>These users were not added:</Title>
              {result.failed.map((user) => (
                <Paragraph className="!my-0" type="danger" key={user.email}>
                  {user.email} ({user.region}): {user.error}
                </Paragraph>
              ))}
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default AssignRoleToUserModal;
