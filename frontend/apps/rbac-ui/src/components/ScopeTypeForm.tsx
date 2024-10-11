import { handleError } from '@/utils';
import { Button, Flex, Form, Input, Space, Typography, message } from 'antd';

import { useState } from 'react';
import { ScopeTypeWithUser } from '@/types';

type FormProps = {
  initialValues?: ScopeTypeWithUser;
  onSubmit?: (loading: boolean) => void;
  onSuccessfulSubmit?: () => void;
  type: 'new' | 'edit';
};

type FormFields = {
  type: 'new' | 'edit';
  scopeType: string;
  description: string;
};

const { Title } = Typography;

const ScopeTypeForm = ({ initialValues, onSubmit, onSuccessfulSubmit, type = 'new' }: FormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const create = (payload: FormFields) => {
    return fetch('/api/rbac/scope_types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  };

  const update = (payload: FormFields) => {
    const { scopeType, description } = payload;
    return fetch(`/api/rbac/scope_types/${scopeType}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });
  };

  const submitData = async (values: FormFields) => {
    if (type === 'edit') return update(values);
    return create(values);
  };

  const onFinish = async (values: FormFields) => {
    onSubmit?.(true);
    setIsLoading(true);
    try {
      const response = await submitData(values);
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
      onSuccessfulSubmit?.();
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Flex gap="middle" justify="space-between">
        <Title level={2} className="my-0">
          {type === 'new' ? 'New scope type' : 'Edit scope type'}
        </Title>
        <Space>
          <Button href="/scope_types">Cancel</Button>
          <Button loading={isLoading} onClick={() => form.submit()} type="primary">
            {type === 'new' ? 'Create' : 'Save'}
          </Button>
        </Space>
      </Flex>
      <Form layout="vertical" initialValues={initialValues} form={form} onFinish={onFinish}>
        <Form.Item
          name="scopeType"
          label="Scope type"
          required
          tooltip="This is a required field"
          rules={[{ required: true, message: 'Please provide scope type' }]}
        >
          <Input showCount maxLength={50} value={initialValues?.scopeType} disabled={type === 'edit'} />
        </Form.Item>
        <Form.Item
          name="description"
          label="Scope type description"
          required
          tooltip="This is a required field"
          rules={[
            {
              required: true,
              message: 'Please provide meaningful description of scope type',
            },
          ]}
        >
          <Input showCount maxLength={100} value={initialValues?.description} />
        </Form.Item>
      </Form>
    </>
  );
};

export default ScopeTypeForm;
