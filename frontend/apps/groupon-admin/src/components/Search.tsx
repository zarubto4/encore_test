import React, { FC } from 'react';
import { Button, Form, Input } from 'antd';

type Search = {
  permalink?: string
}

type Props = {
  onSearch: (value: Search) => void
}

export const Search: FC<Props> = ({ onSearch }) => {
  return (
    <Form
      layout="vertical"
      onFinish={values => onSearch({
        permalink: values.permalink,
      })}
    >
      <Form.Item label="Permalink" name="permalink">
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">Search</Button>
      </Form.Item>
    </Form>
  );
};
