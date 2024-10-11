import { useEffect, useState } from 'react';
import { Modal, Button, Space, message } from 'antd';

import SelectPermissions from '@/components/SelectPermissions';
import RoleCard from '@/components/RoleCard';
import { handleError } from '@/utils';

import type { RolesResponse } from '@vpcs/rbac-client';
import type { PermissionWithUser } from '@/types';
import SelectRoles from '@/components/SelectRoles';
import PermissionCard from '@/components/PermissionCard';

type AssignPermissionModalProps = {
  onSuccess: () => void;
  onCancel?: () => void;
  isModalOpen: boolean;
  role?: RolesResponse | null;
  permission?: PermissionWithUser | null;
  hideRolesIds?: string[];
};

const AssignPermissionModal = ({ onSuccess, onCancel, isModalOpen, role, permission, hideRolesIds }: AssignPermissionModalProps) => {
  const [permissions, setPermissions] = useState<string[]>((permission && [permission.id]) ?? []);
  const [roles, setRoles] = useState<string[]>((role && [role.id]) ?? []);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (role) {
      setRoles([role.id]);
    }
    if (permission) {
      setPermissions([permission.id]);
    }
  }, [role, permission]);

  const handleOk = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/rbac/roles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles, permissions }),
      });
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      !permission && setPermissions([]);
      !role && setRoles([]);
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

  const handlePermissionChange = (permissions: string[]) => {
    setPermissions(permissions);
  };

  const handleRolesChange = (roles: string[]) => {
    setRoles(roles);
  };

  return (
    <Modal
      title={`Assign permission ${roles.length > 1 ? 'to roles' : 'to role'}`}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!permissions.length || !roles.length}
          loading={loading}
          onClick={handleOk}
        >
          Assign {permissions.length > 1 ? 'permissions' : 'permission'} {roles.length > 1 ? 'to roles' : 'to role'}
        </Button>,
      ]}
    >
      {role && (
        <Space direction="vertical" className="w-full">
          <RoleCard role={role} />
          <SelectPermissions mode="multiple" role={role} onPermissionChange={handlePermissionChange} />
        </Space>
      )}
      {permission && (
        <Space direction="vertical" className="w-full">
          <PermissionCard permission={permission} />
          <SelectRoles hideRolesIds={hideRolesIds} mode="multiple" onRolesChange={handleRolesChange} />
        </Space>
      )}
    </Modal>
  );
};

export default AssignPermissionModal;
