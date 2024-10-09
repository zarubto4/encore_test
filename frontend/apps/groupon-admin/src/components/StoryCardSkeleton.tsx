import React, { FC } from 'react';
import { Flex, Skeleton } from 'antd';


export const StoryCardSkeleton: FC = () => {
  return (
    <Flex gap="middle" justify="start">
      <div style={{
        objectFit: 'contain', width: '80px', height: '142px',
        borderRadius: '8px', backgroundColor: '#f5f5f5',
      }} />
      <Skeleton paragraph={{ rows: 3, style: { width: '200px' } }} />
    </Flex>
  );
};
