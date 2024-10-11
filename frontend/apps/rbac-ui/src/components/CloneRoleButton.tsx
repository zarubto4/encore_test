import { useState, ReactNode } from 'react';
import { Button, Input, Modal, Space, Typography, ConfigProvider, Form, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import RoleCard from '@/components/RoleCard';
import { handleError } from '@/utils';

import type { RoleWithUser } from '@/types';
import type { ButtonProps } from 'antd/lib/button';

type Props = ButtonProps & {
  content?: ReactNode;
  withIcon?: boolean;
  userRole: RoleWithUser;
};

type FormFields = {
  name: string;
  description: string;
  categories: string[];
  permissions: string[];
};

const { Paragraph } = Typography;

const CloneRoleButton = ({ withIcon = true, userRole, ...restProps }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const initialValues = {
    ...userRole,
    name: `${userRole.name} (copy)`,
    permissions: userRole.permissions?.map((permission) => permission.id),
    categories: userRole.categories?.map((category) => category.id),
  };

  const modalStyles = {
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
    },
  };

  const onFinish = async (payload: FormFields) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/rbac/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      const { id } = await response.json();
      message.success('Role cloned successfully');
      setIsModalOpen(false);
      window.location.href = `/roles/${id}`;
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        data-testid="clone-role-button-open-modal"
        danger
        loading={isLoading}
        onClick={() => setIsModalOpen(true)}
        icon={withIcon && <CopyOutlined />}
        {...restProps}
      >
        Clone role
      </Button>
      <ConfigProvider modal={{ styles: modalStyles }}>
        <Modal
          title="Clone role"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel} data-testid="cancel-button-close-modal">
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              danger
              loading={isLoading}
              onClick={() => form.submit()}
              data-testid="submit-button-clone-role"
            >
              Clone
            </Button>,
          ]}
        >
          <Space data-testid="clone-role-modal" direction="vertical" className="w-full">
            <RoleCard role={userRole} />
            <Form layout="vertical" initialValues={initialValues} form={form} onFinish={onFinish}>
              <Form.Item name="categories" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="permissions" hidden>
                <Input />
              </Form.Item>
              <Form.Item
                name="name"
                label="Role name"
                required
                tooltip="This is a required field"
                rules={[{ required: true, message: 'Please provide role name' }]}
              >
                <Input showCount maxLength={50} value={initialValues.name} />
              </Form.Item>
              <Form.Item
                name="description"
                label="Role description"
                required
                tooltip="This is a required field"
                rules={[
                  {
                    required: true,
                    message: 'Please provide meaningful description of role',
                  },
                ]}
              >
                <Input showCount maxLength={100} value={initialValues.description} />
              </Form.Item>
            </Form>
            <Paragraph>
              Role will be cloned with assigned categories and permissions. You can change them later.
            </Paragraph>
          </Space>
        </Modal>
      </ConfigProvider>
    </>
  );
};

export default CloneRoleButton;
