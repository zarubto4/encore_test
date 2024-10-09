import React, { FC, useEffect, useState } from 'react';
import { Button, Flex, Popconfirm, PopconfirmProps, Typography } from 'antd';
import { api } from '@/trpc/react';
import { AssignStoryCheckbox } from '@/components/AssignStoryCheckbox';

const { Text, Title } = Typography;

interface Props {
  id: string;
}

export const StoryDetail: FC<Props> = ({ id }) => {
  const [status, setStatus] = useState<string>();
  const story = api.stories.get.useQuery({ id: id as string }, {
    refetchInterval: status === 'new' ? 15_000 : false,
  });
  useEffect(() => {
    if (status !== story.data?.status) {
      setStatus(story.data?.status);
    }
  }, [story.data?.status]);

  const remove = api.stories.delete.useMutation({
    onSuccess: () => story.refetch(),
  });

  if (story.isLoading) return <p>Loading...</p>;
  if (story.error) <p>{story.error.message}</p>;


  const confirm: PopconfirmProps['onConfirm'] = () => {
    remove.mutate({ id });
  };


  return (
    story.data ? (
      <Flex vertical gap="small">
        {story.data.error && <p>{story.data.error}</p>}
        <Title level={2}>{story.data.title}</Title>
        <Flex gap="small">
          {story.data.status === 'new'
            ? <div>
              Processing video...
            </div>
            : <video src={story.data.videoUrl} width={300} controls poster={story.data.coverImageUrls?.[0]} />
          }
          <Flex vertical gap="small">
            <Text type="secondary">Deal ID: {story.data.dealId}</Text>
            <Text type="secondary">Status: {story.data.status}</Text>
            <AssignStoryCheckbox story={story.data} />
            <Popconfirm
              title="Delete the story"
              description="Are you sure to delete this story?"
              onConfirm={confirm}
              okText="Yes"
              cancelText="No"
            >
              <Button danger loading={remove.isPending}>Delete</Button>
            </Popconfirm>
          </Flex>
        </Flex>
      </Flex>
    ) : null
  );
};
