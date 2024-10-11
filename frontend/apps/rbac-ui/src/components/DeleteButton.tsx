import { ReactNode, useState } from 'react';
import { Button, Input, Modal, Space, Typography, ConfigProvider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import CategoryCard from '@/components/CategoryCard';
import PermissionCard from '@/components/PermissionCard';
import RoleCard from '@/components/RoleCard';

import type { CategoriesWithUser, PermissionWithUser, RoleWithUser } from '@/types';
import type { ButtonProps } from 'antd/lib/button';

type DeleteButtonProps = ButtonProps & {
  onOk: () => void;
  onCancel?: () => void;
  content?: ReactNode;
  title?: ReactNode;
  size?: 'small' | 'middle' | 'large';
  loading?: boolean;
  children?: ReactNode;
  withIcon?: boolean;
  category?: CategoriesWithUser;
  permission?: PermissionWithUser;
  userRole?: RoleWithUser;
};

const { Text, Paragraph } = Typography;

const DeleteButton = ({
  onOk,
  onCancel,
  title = 'Are you sure you want to delete?',
  size = 'small',
  loading = false,
  children,
  withIcon = true,
  category,
  permission,
  userRole,
  ...restProps
}: DeleteButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const resolveTitle = () => {
    if (category) {
      return 'Are you sure you want to delete this category?';
    }
    if (permission) {
      return 'Are you sure you want to delete this permission?';
    }
    if (userRole) {
      return 'Are you sure you want to delete this role?';
    }
    return title;
  };

  const resolveKeyword = () => {
    if (category) {
      return category.name;
    }
    if (permission) {
      return permission.code;
    }
    if (userRole) {
      return userRole.name;
    }
    return 'delete';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.trim() === resolveKeyword()) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    onCancel?.();
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    onOk();
  };

  const modalStyles = {
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
    },
  };

  return (
    <>
      <Button
        danger
        loading={loading}
        size={size}
        onClick={() => setIsModalOpen(true)}
        icon={withIcon && <DeleteOutlined />}
        {...restProps}
        data-testid="delete-button-open-modal"
      >
        {children}
      </Button>
      <ConfigProvider
        modal={{
          styles: modalStyles,
        }}
      >
        <Modal
          title={resolveTitle()}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel} data-testid="cancel-button-close-modal">
              Cancel
            </Button>,
            <Button key="submit" type="primary" danger disabled={!isValid} loading={loading} onClick={handleConfirm} data-testid="confirm-button-delete">
              Delete
            </Button>,
          ]}
        >
          <Space data-testid="delete-modal" direction="vertical" className="w-full">
            {category && (
              <>
                <CategoryCard category={category} />
                <Paragraph>
                  All the entities that are assigned to this category will lose it. This action is irreversible.
                </Paragraph>
              </>
            )}
            {permission && (
              <>
                <PermissionCard permission={permission} />
                <Paragraph>
                  All the entities that are assigned to this permission will lose it. This action is irreversible.
                </Paragraph>
              </>
            )}
            {userRole && (
              <>
                <RoleCard role={userRole} />
                <Paragraph>
                  All the entities that are assigned to this role will lose it. This action is irreversible.
                </Paragraph>
              </>
            )}
            <Text>To confirm, type “{resolveKeyword()}” in the input below</Text>
            <Input
              status={!isValid ? 'warning' : ''}
              type="text"
              onChange={handleInputChange}
              placeholder="Type to continue"
              data-testid="confirmation-input"
            />
          </Space>
        </Modal>
      </ConfigProvider>
    </>
  );
};

export default DeleteButton;
