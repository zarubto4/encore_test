import { useCallback, useMemo, useState } from 'react';
import { Modal, Button, Space, Typography, message, Checkbox, Form } from 'antd';
import { green, red } from '@ant-design/colors';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

import { handleError } from '@/utils';
import SelectUser from '@/components/SelectUser';
import RoleCard from '@/components/RoleCard';
import { USER_REGION_SELECT } from '@/constants';

import type { RolesResponse } from 'libs/rbac-client/src';
import { AssignResultType } from '@/types';

type AddRoleOwnerModalProps = {
  onSuccess: (isModalOpen: boolean) => void;
  onCancel?: () => void;
  isModalOpen: boolean;
  role: RolesResponse;
};

const { Title, Text, Paragraph } = Typography;

const AddRoleOwnerModal = ({ onSuccess, onCancel, isModalOpen, role }: AddRoleOwnerModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [result, setResult] = useState<AssignResultType | null>(null);
  const [regions, setRegions] = useState<string[]>([USER_REGION_SELECT[0]]);

  const handleFinish = useCallback(() => {
    setEmails([]);
    if (result?.success.length) {
      onSuccess?.(false);
    } else {
      onCancel?.();
    }
    setResult(null);
  }, [onCancel, onSuccess, result]);

  const handleOk = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/rbac/roles/${role.id}/owners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails, regions }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      const data: AssignResultType = await response.json();
      setResult(data);
      onSuccess?.(true);
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel && onCancel();
  };

  const handleEmailChange = (emails: string[]) => {
    setEmails(emails);
  };

  const handleRegionChange = (regions: string[]) => {
    setRegions(regions);
  };

  const initialValues = useMemo(
    () => ({
      regions: [USER_REGION_SELECT[0]],
    }),
    [],
  );

  return (
    <Modal
      title={!result && `Assign ${emails.length > 1 ? 'owners' : 'owner'} to role`}
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
                disabled={emails.length === 0 || regions.length === 0}
                loading={loading}
                onClick={handleOk}
              >
                Assign {emails.length > 1 ? 'owners' : 'owner'}
              </Button>,
            ]
          : [
              <Button key="submit" onClick={handleFinish}>
                Close
              </Button>,
            ]
      }
    >
      {!result ? (
        role && (
          <Space direction="vertical" className="w-full">
            <RoleCard role={role} />
            <Form layout="vertical" initialValues={initialValues}>
              <Form.Item
                name="regions"
                label="Select Region"
                required
                rules={[{ required: true, message: 'Please select at least one region' }]}
              >
                <Checkbox.Group
                  onChange={handleRegionChange}
                  options={USER_REGION_SELECT.map((region) => ({ value: region, label: region }))}
                />
              </Form.Item>
              <Form.Item
                required
                name="email"
                label="Enter user's email address"
              >
                <SelectUser onUsersChange={handleEmailChange} />
              </Form.Item>
            </Form>
          </Space>
        )
      ) : (
        <>
          {result.success.length > 0 && (
            <div className="text-center mt-8">
              <CheckCircleOutlined style={{ fontSize: 54, color: green.primary }} />
              <Title level={4}>
                Successfully granted ownership of
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
                <Text type="danger" key={user.email}>
                  {user.email} ({user.region}): {user.error}
                </Text>
              ))}
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default AddRoleOwnerModal;
