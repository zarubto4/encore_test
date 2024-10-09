import React, { FC, Fragment } from 'react';
import { StoryCard } from '@/components/StoryCard';
import { Stories } from '@/server/routers/stories';
import Link from 'next/link';
import { Divider, Flex } from 'antd';


type Props = {
  stories: Stories['stories']
}

export const StoryList: FC<Props> = ({
                                       stories,
                                     }) => {
  return (
    <Flex vertical>
      {stories.map((story) => (
        <Fragment key={story.id}>
          <Link href={'/stories/' + story.id}>
            <StoryCard story={story} />
          </Link>
          <Divider />
        </Fragment>
      ))}
    </Flex>
  );
};
