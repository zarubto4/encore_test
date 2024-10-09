import React, { FC, useState } from 'react';
import { Button, Form, Input, Typography, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';

const { Text } = Typography;

type UploadFormFields = {
  dealPermalink: string
}

export const UploadStoryForm: FC = () => {
  const router = useRouter();
  const [video, setVideo] = useState<string>();
  const { isPending, error, mutate } = useMutation({
    mutationFn: async (values: UploadFormFields) => {
      const formData = new FormData();
      formData.append('dealPermalink', values.dealPermalink);
      // @ts-expect-error TODO: Fix this type error
      formData.append('File', values.video[0].originFileObj);
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      return await response.json();
    },
    onSuccess: async () => {
      await router.push('/stories/');
    },
  });
  const onFinish = async (values: UploadFormFields) => {
    mutate(values);
  };
  return (
    <Form<UploadFormFields>
      name="upload-story"
      onFinish={onFinish}
      initialValues={{}}
      layout="vertical"
      style={{
        width: '640px',
      }}
    >
      {error && <Text type="danger">{error.message}</Text>}
      <Form.Item name="video" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                 noStyle required>
        <Upload.Dragger
          name="File"
          beforeUpload={() => false}
          disabled={isPending}
          accept="video/*"
          // @ts-expect-error TODO: Fix this type error
          onChange={e => setVideo(e.fileList.length ? URL.createObjectURL(e.file) : undefined)}
        >
          {video ? <video src={video} controls width="200" /> :
            <>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag video to this area to upload</p>
            </>
          }
        </Upload.Dragger>
      </Form.Item>

      <Form.Item name="dealPermalink" label="Deal permalink" required>
        <Input required disabled={isPending} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isPending}>
          Add Story
        </Button>
      </Form.Item>
    </Form>
  );
};
