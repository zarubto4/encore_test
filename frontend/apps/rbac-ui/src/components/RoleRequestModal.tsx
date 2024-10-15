import { useState, useCallback, useMemo } from 'react';
import { Modal, Form, Button, message, Input, Checkbox } from 'antd';

import { ScopeType } from '@vpcs/rbac-client';
import { handleError } from '@/utils';
import SelectRoles from '@/components/SelectRoles';
import RoleCard from '@/components/RoleCard';
import SelectScopeType from '@/components/SelectScopeType';
import { USER_REGION_SELECT } from '@/constants';

import type { RolesResponse } from '@vpcs/rbac-client';
import type { AssignResultType } from '@/types';

type RoleRequestModalProps = {
  onSuccess: () => void;
  onCancel?: () => void;
  isModalOpen: boolean;
  role?: RolesResponse | null;
  myRolesIds?: string[];
};

const { TextArea } = Input;

type FormFields = {
  scopeType: ScopeType;
  scopeValue: string;
  comment: string;
  regions: string[];
};

const RoleRequestModal = ({ onSuccess, onCancel, isModalOpen, role, myRolesIds }: RoleRequestModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRoles, setSelectedRoles] = useState<string[] | null>(null);
  const [result, setResult] = useState<AssignResultType | null>(null);
  const [scope, setScope] = useState<ScopeType>('GLOBAL');

  const handleCancel = () => {
    onCancel?.();
  };

  const handleRolesChange = useCallback((roles: string[]) => {
    setSelectedRoles(roles);
  }, []);

  const onFinish = async (values: FormFields) => {
    setLoading(true);
    setResult(null);

    let roles = '';
    if (role) {
      roles = role.id;
    } else if (Array.isArray(selectedRoles)) {
      roles = selectedRoles[0];
    }

    try {
      const response = await fetch('/api/rbac/roles/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: roles,
          scopeType: scope,
          scopeValue: values.scopeValue,
          comment: values.comment,
          regions: values.regions,
        }),
      });
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      message.success('Role requested successfully');
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
      scopeType: '',
      scopeValue: '',
      comment: '',
      regions: [USER_REGION_SELECT[0]],
    }),
    [],
  );

  return (
    <Modal
      title={!result ? 'Request Role' : ''}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          Send Request
        </Button>,
      ]}
    >
      <>
        {role && <RoleCard role={role} />}
        {!role && <SelectRoles mode="multiple" hideRolesIds={myRolesIds} onRolesChange={handleRolesChange} />}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
          className="my-4"
          disabled={loading}
        >
          <Form.Item name="scopeType" required label="Scope type">
            <SelectScopeType onChange={setScope} />
          </Form.Item>
          <Form.Item
            name="regions"
            label="Select Region"
            required
            rules={[{ required: true, message: 'Please select at least one region' }]}
          >
            <Checkbox.Group options={USER_REGION_SELECT.map((region) => ({ value: region, label: region }))} />
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
          <Form.Item
            name="comment"
            label="Tell us why you need this role"
            required
            tooltip="This is a required field"
            rules={[{ required: true, message: 'Please provide reason' }]}
          >
            <TextArea rows={4} placeholder="Describe reason" />
          </Form.Item>
        </Form>
      </>
    </Modal>
  );
};

export default RoleRequestModal;
