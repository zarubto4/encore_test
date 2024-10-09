import React, { FC } from 'react';
import { Checkbox, type CheckboxProps, Flex, Typography } from 'antd';
import { api } from '@/trpc/react';
import { Story } from '@/server/routers/stories';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Props {
  story: Story;
}

export const AssignStoryCheckbox: FC<Props> = ({ story }) => {
  const assign = api.stories.assign.useMutation();
  const unassign = api.stories.unassign.useMutation();
  const isLoading = assign.isPending || unassign.isPending;

  const handleAssign: CheckboxProps['onChange'] = (e) => {
    if (!story.dealId) {
      return;
    }
    const options = {
      dealId: story.dealId,
      id: story.id,
    };
    if (e.target.checked) {
      assign.mutate(options);
    } else {
      unassign.mutate(options);
    }
  };

  return (
    <Flex gap="small">
      {isLoading && <LoadingOutlined />}
      <Checkbox onChange={handleAssign} defaultChecked={story.isInDealGallery}
                disabled={!story.dealId}>
        <Text type="secondary">Displayed in deal gallery</Text>
      </Checkbox>
    </Flex>
  );
};
