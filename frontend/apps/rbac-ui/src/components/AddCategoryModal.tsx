import { useState } from 'react';
import { Modal, Button, message, Space } from 'antd';

import SelectPermissions from '@/components/SelectPermissions';
import { handleError } from '@/utils';

import CategoryCard from '@/components/CategoryCard';
import SelectRoles from '@/components/SelectRoles';

import type { CategoriesWithUser } from '@/types';

type AddCategoryToRoleModalProps = {
  onSuccess: () => void;
  onCancel?: () => void;
  isModalOpen: boolean;
  category: CategoriesWithUser;
  type: 'role' | 'permission';
};

const AddCategoryToRoleModal = ({ onSuccess, onCancel, isModalOpen, category, type }: AddCategoryToRoleModalProps) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleOk = async () => {
    setLoading(true);

    try {
      const id = category.id;
      const response = await fetch(`/api/rbac/categories`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId: id, permissions, roles }),
      });
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      setPermissions([]);
      setRoles([]);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handlePermissionsChange = (permissions: string[]) => {
    setPermissions(permissions);
  };

  const handleRolesChange = (roles: string[]) => {
    setRoles(roles);
  };

  return (
    <Modal
      title={`Assign category to ${type === 'permission' ? 'permissions' : 'roles'}`}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={(type === 'permission' && !permissions.length) || (type === 'role' && !roles.length)}
          loading={loading}
          onClick={handleOk}
        >
          Assign category
        </Button>,
      ]}
    >
      <Space direction="vertical" className="w-full">
        <CategoryCard category={category} />
        {type === 'permission' && <SelectPermissions mode="multiple" onPermissionChange={handlePermissionsChange} />}
        {type === 'role' && <SelectRoles mode="multiple" onRolesChange={handleRolesChange} />}
      </Space>
    </Modal>
  );
};

export default AddCategoryToRoleModal;
