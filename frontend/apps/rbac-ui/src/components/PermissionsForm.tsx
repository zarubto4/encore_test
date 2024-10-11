import { handleError } from '@/utils';
import { Button, Flex, Form, Input, Space, Typography, message } from 'antd';
import { useState } from 'react';
import SelectCategories from '@/components/SelectCategories';
import DeleteButton from '@/components/DeleteButton';

import type { PermissionWithUser } from '@/types';

type FormProps = {
  permission?: PermissionWithUser;
  onSubmit?: (loading: boolean) => void;
  onSuccessfulSubmit?: () => void;
  onDismiss?: () => void;
};

type FormFields = {
  id?: string;
  code?: string;
  name: string;
  description: string;
  categories?: string[];
};

const { Title } = Typography;

const createNewPermission = (payload: FormFields) => {
  return fetch('/api/rbac/permissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
};

const updatePermission = (payload: FormFields, categoriesToBeRemoved: string[]) => {
  const { id, code, ...updatePayload } = payload;
  return fetch(`/api/rbac/permissions/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...updatePayload, categoriesToBeRemoved }),
  });
};

const deletePermission = (id: string) => {
  return fetch(`/api/rbac/permissions/${id}`, {
    method: 'DELETE',
  });
};

const submitData = async (values: FormFields, categoriesToBeRemoved: string[]) => {
  return values.id ? updatePermission(values, categoriesToBeRemoved) : createNewPermission(values);
};

const PermissionsForm = ({ permission, onSubmit, onSuccessfulSubmit, onDismiss }: FormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const validatePermissionCode = (code: string) => {
    const isValidFormat = /^[A-Z0-9_:]+$/.test(code) && (code.match(/:/g) || []).length === 2;
    return isValidFormat ? code : null;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursorPosition = input.selectionStart || 0;
  
    const sanitizedCode = input.value.toUpperCase().replace(/[^A-Z0-9:_]/g, '');
  
    form.setFieldsValue({ code: sanitizedCode });
  
    const newCursorPosition = cursorPosition - (input.value.length - sanitizedCode.length);
    
    requestAnimationFrame(() => {
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  };
  

  const onFinish = async (values: FormFields) => {
    setIsLoading(true);

    const validatedCode = validatePermissionCode(values.code || '');
    if (!validatedCode) {
      message.error('Invalid permission code format. Ensure it follows RESOURCE:SCOPE:ACTION and contains exactly three colons.');
      setIsLoading(false);
      return;
    }
    
    values.code = validatedCode;

    const categoriesToBeSaved = values.categories ?? [];
    const categoriesInitial = initialCategories;

    const categoriesToBeRemoved = categoriesInitial.filter((category) => !categoriesToBeSaved.includes(category));

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

  const handleDeletePermission = (id: string) => {
    deletePermission(id);
  };

  const initialCategories: string[] =
    permission?.categories?.map((category) => category.id).filter((id): id is string => id !== undefined) ?? [];

  if (initialCategories.length > 0) {
    form.setFieldsValue({ categories: initialCategories });
  }

  return (
    <>
      <Flex gap="middle" justify="space-between">
        <Title level={2} className="my-0">
          {permission?.id ? permission.code : 'New Permission'}
        </Title>
        <Space align="start">
          {permission?.id ? (
            <DeleteButton
              permission={permission}
              size="middle"
              loading={isLoading}
              onOk={() => handleDeletePermission(permission.id)}
            />
          ) : (
            <Button href="/permissions">Cancel</Button>
          )}
          <Button loading={isLoading} onClick={() => form.submit()} type="primary">
            {permission?.id ? 'Save' : 'Create'}
          </Button>
        </Space>
      </Flex>
      <Form layout="vertical" initialValues={permission} form={form} onFinish={onFinish}>
        <Form.Item name="id" hidden>
          <Input value={permission?.id} />
        </Form.Item>
        <Form.Item
          name="code"
          label="Permission Code"
          required
          tooltip="This is a required field"
          rules={[
            { 
              required: true, 
              message: 'Please provide permission code' 
            },
            {
              validator: (_, value) => {
                if (!value || validatePermissionCode(value)) {
                  return Promise.resolve();
                }
                return Promise.reject('Invalid permission code format. Ensure it follows RESOURCE:SCOPE:ACTION and contains exactly two colons.');
              },
            },
          ]}
        >
          <Input 
            showCount 
            maxLength={50} 
            disabled={!!permission?.id} 
            onChange={handleCodeChange}
          />
        </Form.Item>
        <Form.Item
          name="categories"
          label="Permission categories"
          rules={[
            {
              required: true,
              message: 'Please provide at least one permission category',
            },
          ]}
        >
          <SelectCategories initialCategories={initialCategories} onCategoriesChange={handleCategoriesChange} />
        </Form.Item>
        <Form.Item
          name="description"
          label="Permission Description"
          required
          tooltip="This is a required field"
          rules={[
            {
              required: true,
              message: 'Please provide a meaningful description of the permission',
            },
          ]}
        >
          <Input showCount maxLength={100} value={permission?.description} />
        </Form.Item>
      </Form>
    </>
  );
};

export default PermissionsForm;
