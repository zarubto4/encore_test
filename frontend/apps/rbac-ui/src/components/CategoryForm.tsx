import { handleError } from '@/utils';
import { Button, Flex, Form, Input, Space, Typography, message } from 'antd';

import DeleteButton from '@/components/DeleteButton';
import { useState } from 'react';
import { CategoriesWithUser } from '@/types';

type FormProps = {
  initialValues?: CategoriesWithUser;
  onSubmit?: (loading: boolean) => void;
  onSuccessfulSubmit?: () => void;
  onSuccessfulDelete?: () => void;
};

type FormFields = {
  id?: string;
  name: string;
  description: string;
};

const { Title } = Typography;

const createNewCategory = (payload: FormFields) => {
  return fetch('/api/rbac/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
};

const updateCategory = (payload: FormFields) => {
  const { description } = payload;
  return fetch(`/api/rbac/categories/${payload.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ description }),
  });
};

export const deleteCategory = (id: string) => {
  return fetch(`/api/rbac/categories/${id}`, {
    method: 'DELETE',
  });
};

const submitData = async (values: FormFields) => {
  if (values.id) return updateCategory(values);
  return createNewCategory(values);
};

const CategoryForm = ({ initialValues, onSubmit, onSuccessfulSubmit, onSuccessfulDelete }: FormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const processDelete = async (id: string) => {
    onSubmit && onSubmit(true);
    setIsLoading(true);
    try {
      const response = await deleteCategory(id);
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      onSuccessfulDelete && onSuccessfulDelete();
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    } finally {
      onSubmit && onSubmit(false);
      setIsLoading(false);
    }
  };

  const onFinish = async (values: FormFields) => {
    onSubmit && onSubmit(true);
    setIsLoading(true);
    try {
      const response = await submitData(values);
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      onSuccessfulSubmit && onSuccessfulSubmit();
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    } finally {
      onSubmit && onSubmit(false);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Flex gap="middle" justify="space-between">
        <Title level={2} className="my-0">
          {initialValues?.name ?? 'New category'}
        </Title>
        <Space align="start">
          {!initialValues?.id && <Button href="/categories">Cancel</Button>}
          {initialValues?.id && (
            <DeleteButton
              category={initialValues}
              size="middle"
              loading={isLoading}
              onOk={() => processDelete(initialValues.id)}
              content={`Are you sure you want to delete category ${initialValues.name}?`}
            />
          )}
          <Button loading={isLoading} onClick={() => form.submit()} type="primary">
            {initialValues?.id ? 'Save' : 'Create'}
          </Button>
        </Space>
      </Flex>
      <Form layout="vertical" initialValues={initialValues} form={form} onFinish={onFinish}>
        {initialValues?.id && (
          <Form.Item name="id" hidden>
            <Input value={initialValues.id} />
          </Form.Item>
        )}
        <Form.Item
          name="name"
          label="Category name"
          required
          tooltip="This is a required field"
          rules={[{ required: true, message: 'Please provide category name' }]}
        >
          <Input showCount maxLength={50} disabled={!!initialValues?.id} value={initialValues?.name} />
        </Form.Item>
        <Form.Item
          name="description"
          label="Category description"
          required
          tooltip="This is a required field"
          rules={[
            {
              required: true,
              message: 'Please provide meaningful description of category',
            },
          ]}
        >
          <Input showCount maxLength={100} value={initialValues?.description} />
        </Form.Item>
      </Form>
    </>
  );
};

export default CategoryForm;
