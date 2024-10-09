import React, { FC } from 'react';
import { Flex, Typography } from 'antd';
import type { Story } from '@/server/routers/stories';
import dayjs from 'dayjs';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { AssignStoryCheckbox } from '@/components/AssignStoryCheckbox';

const { Text } = Typography;

interface Props {
  story: Story;
}

export const StoryCard: FC<Props> = ({ story }) => {
  const {
    title,
    createdAt,
    videoUrl,
    dealId,
    error,
    status,
    coverImageUrls,
  } = story;
  const coverImage = coverImageUrls?.[0];
  return (
    <Flex justify="space-between">
      <Flex gap="middle">
        {coverImage
          ? <img width="80" height="142" src={coverImage + '/v1/t300x182.webp'} style={{
            objectFit: 'contain', width: '80px', height: '142px',
            borderRadius: '8px', backgroundColor: '#f5f5f5',
          }} />
          : <video src={videoUrl} width="80" height="142"
                   style={{
                     objectFit: 'contain', width: '80px', height: '142px',
                     borderRadius: '8px', backgroundColor: '#f5f5f5',
                   }} />
        }
        <Flex vertical justify="space-between">
          <Flex vertical gap="small">
            <Text strong>{title}</Text>
            <Text type="secondary">Uploaded on {dayjs(createdAt).format('YYYY-MM-DD')}</Text>
            {dealId && <Text type="secondary">Deal ID {dealId}</Text>}
            {error && <Text type="secondary">Error: {error}</Text>}
            {<Text type="secondary">Status: {status}</Text>}
          </Flex>
          {dealId ? <Text type="secondary"><CheckCircleFilled /> Assigned to a deal</Text> :
            <Text type="secondary"><CloseCircleFilled /> Not assigned to a deal</Text>}
        </Flex>
      </Flex>
      <div onClick={e => e.stopPropagation()}>
        <AssignStoryCheckbox story={story} />
      </div>
    </Flex>
  );
};
