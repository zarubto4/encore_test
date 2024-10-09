import { useState } from 'react';
import { Button, Form, Input, message, Radio } from 'antd';

import { parseError } from '@/lib/utils';
import { DOMAINS } from '@/constants';

import type { FormProps, RadioChangeEvent } from 'antd';

type FieldType = {
  email?: string;
};

const LoginForm = ({
  returnPath,
  email,
  domain,
}: {
  returnPath: string;
  email?: string;
  domain?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(domain || DOMAINS[0]);

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('/api/login/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          const error = errorData.errors[0];
          if (
            error.subject === 'request_limit' &&
            error.errorCode === 'exceeded'
          ) {
            throw new Error('Rate limit exceeded');
          }
        }
        throw new Error(errorData.message || 'An unexpected error occurred');
      }
      window.location.href = returnPath || '/';
    } catch (error) {
      const errorMessage = parseError(error);
      message.open({
        type: 'error',
        content: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e: RadioChangeEvent) => {
    setSelectedDomain(e.target.value);
  };

  return (
    <div style={{ padding: 16, minWidth: 300, maxWidth: 600 }}>
      <h1>Developer login</h1>
      <p>This login page is only for local development.</p>
      <Form
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        initialValues={{ email, domain: selectedDomain }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter @groupon.com email' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Domain" name="domain">
          <Radio.Group onChange={onChange}>
            {DOMAINS.map((d) => (
              <Radio key={d} value={d}>
                {d}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button block type="primary" htmlType="submit" loading={loading}>
            Log in
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;