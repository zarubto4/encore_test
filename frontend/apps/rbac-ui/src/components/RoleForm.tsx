import { useEffect, useMemo, useState, ReactNode } from 'react';
import { handleError } from '@/utils';
import { Button, Flex, Form, Input, Space, Typography, message } from 'antd';
import router from 'next/router';

import DeleteButton from '@/components/DeleteButton';
import User from '@/components/User';
import SelectCategories from '@/components/SelectCategories';
import SelectPermissions from '@/components/SelectPermissions';
import RoleRequestModal from '@/components/RoleRequestModal';
import { formatDateString } from '@/utils';
import CloneRoleButton from '@/components/CloneRoleButton';

import type { RoleWithUser } from '@/types';

type FormProps = {
  role?: RoleWithUser;
  onSuccessfulSubmit?: () => void;
  onSuccessfulDelete?: () => void;
  disabled?: boolean;
  children?: ReactNode;
};

type FormFields = {
  id?: string;
  name: string;
  description: string;
  categories?: string[];
  permissions?: string[];
};

const { Title, Paragraph } = Typography;

const createNewRole = (payload: FormFields) => {
  return fetch('/api/rbac/roles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
};

const updateRole = (payload: FormFields, categoriesToBeRemoved: string[]) => {
  const { description, categories = [], permissions = [] } = payload;
  return fetch(`/api/rbac/roles/${payload.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ description, categories, permissions, categoriesToBeRemoved }),
  });
};

const deleteRole = (id: string) => {
  return fetch(`/api/rbac/roles/${id}`, {
    method: 'DELETE',
  });
};

const submitData = async (values: FormFields, categoriesToBeRemoved: string[]) => {
  if (values.id) return updateRole(values, categoriesToBeRemoved);
  return createNewRole(values);
};

const RoleForm = ({ role, onSuccessfulSubmit, onSuccessfulDelete, disabled = false, children }: FormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [form] = Form.useForm();

  const initialCategories = useMemo(
    () => role?.categories?.map((category) => category.id).filter((id): id is string => id !== undefined) ?? [],
    [role?.categories],
  );

  useEffect(() => {
    if (initialCategories.length > 0) {
      form.setFieldsValue({ categories: initialCategories });
    }
  }, [initialCategories, form]);

  const processDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await deleteRole(id);
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      onSuccessfulDelete && onSuccessfulDelete();
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const onFinish = async (values: FormFields) => {
    setIsLoading(true);

    const categoriesToBeSaved = values.categories ?? [];
    const categoriesToBeRemoved = initialCategories.filter((category) => !categoriesToBeSaved.includes(category));

    try {
      const response = await submitData(values, categoriesToBeRemoved);
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      onSuccessfulSubmit && onSuccessfulSubmit();
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoriesChange = (categories: string[]) => {
    form.setFieldsValue({ categories });
  };

  const handlePermissionChange = (permissions: string[]) => {
    form.setFieldsValue({ permissions });
  };

  const handleCancel = () => {
    setIsRequestModalOpen(false);
  };

  const handleSuccess = () => {
    setIsRequestModalOpen(false);
    router.push('/requests');
  };

  return (
    <>
      <Flex gap="middle" justify="space-between">
        <Title level={2} className="my-0">
          {role?.name ?? 'New role'}
        </Title>
        <Space align="start">
          {disabled && (
            <Button type="primary" onClick={() => setIsRequestModalOpen(true)}>
              Request role
            </Button>
          )}
          {!disabled && (
            <>
              {role?.id && (
                <>
                  <DeleteButton userRole={role} size="middle" disabled={isLoading} onOk={() => processDelete(role.id)} />
                  <CloneRoleButton userRole={role} disabled={isLoading} />
                </>
              )}
              {!role && <Button href="/roles">Cancel</Button>}
              <Button loading={isLoading} onClick={() => form.submit()} type="primary">
                Save
              </Button>
            </>
          )}
        </Space>
      </Flex>
      <Flex gap="middle" justify="space-between" className="flex-col sm:flex-row">
        <div className={role?.id ? 'sm:w-1/2' : 'w-full'}>
          <Form layout="vertical" initialValues={role} form={form} disabled={disabled} onFinish={onFinish}>
            <Title level={3} className="my-0">
              General information
            </Title>
            <Form.Item name="id" hidden>
              <Input value={role?.id} />
            </Form.Item>
            <Form.Item
              name="name"
              label="Role name"
              required
              tooltip="This is a required field"
              rules={[{ required: true, message: 'Please provide role name' }]}
            >
              <Input showCount maxLength={50} disabled={!!role?.id} value={role?.name} />
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
              <Input showCount maxLength={100} value={role?.description} />
            </Form.Item>
            <Form.Item
              required
              name="categories"
              label="Role categories"
              rules={[
                {
                  required: true,
                  message: 'Please select at least one category',
                },
              ]}
            >
              <SelectCategories
                disabled={disabled}
                initialCategories={initialCategories}
                onCategoriesChange={handleCategoriesChange}
              />
            </Form.Item>
            {!role?.id && (
              <Form.Item
                required
                name="permissions"
                label="Role permissions"
                rules={[
                  {
                    required: true,
                    message: 'Please select at least one permission',
                  },
                ]}
              >
                <SelectPermissions mode="multiple" onPermissionChange={handlePermissionChange} />
              </Form.Item>
            )}
          </Form>
          {role?.id && (
            <>
              <Space direction="vertical">
                <div>
                  <Paragraph className="!mb-1">Date and time of creation</Paragraph>
                  <Paragraph>{formatDateString(role.createdAt)}</Paragraph>
                </div>
                <div>
                  <Paragraph className="!mb-1">Created by</Paragraph>
                  <User show="both" userId={role.createdBy} user={role.createdByUser} />
                </div>
              </Space>
            </>
          )}
        </div>
        {role?.id && <div className="sm:w-1/2">{children}</div>}
      </Flex>
      <RoleRequestModal
        role={role}
        myRolesIds={[]}
        isModalOpen={isRequestModalOpen}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </>
  );
};

export default RoleForm;
