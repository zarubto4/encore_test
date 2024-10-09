import { NextPage } from 'next';
import { Button, Divider, Flex, Pagination, Typography } from 'antd';

import Head from '@/components/Head';
import { getServerSideProps, withUser } from '@/hoc/withUser';
import { StoryList } from '@/components/StoryList';
import { api } from '@/trpc/react';
import { Fragment, useState } from 'react';
import { Search } from '@/components/Search';
import { CloudUploadOutlined } from '@ant-design/icons';
import { StoryCardSkeleton } from '@/components/StoryCardSkeleton';

const PAGE_TITLE = 'All Stories';

type PaginationState = {
  page: number
  pageSize: number
}
type SearchState = {
  pagination: PaginationState
  permalink?: string
}
const INITIAL_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 10,
};

const Page: NextPage = () => {
  const [search, setSearch] = useState<SearchState>({
    pagination: INITIAL_PAGINATION,
  });
  const stories = api.stories.search.useQuery({
    permalink: search.permalink,
    limit: search.pagination.pageSize,
    offset: search.pagination.page * search.pagination.pageSize - search.pagination.pageSize,
  });
  const { Title } = Typography;
  return (
    <>
      <Head title={PAGE_TITLE} />
      <main>
        <Flex gap="middle" justify="space-between" align="center">
          <Title level={2} className="my-0">
            {PAGE_TITLE}
          </Title>
          <Button href="/stories/new" type="primary" icon={<CloudUploadOutlined />}>Upload Story</Button>
        </Flex>
        <Flex gap="middle" vertical>
          <Search onSearch={(values) => setSearch(s => ({
            ...s,
            permalink: values.permalink,
            pagination: INITIAL_PAGINATION,
          }))} />
          {stories.isLoading &&
            <Flex vertical>
              {Array.from({ length: search.pagination.pageSize }, (_, i) => <Fragment
                key={i}><StoryCardSkeleton /><Divider /></Fragment>)}
            </Flex>
          }
          {stories.error && <p>{stories.error.message}</p>}
          {stories.data?.stories && <>
            <StoryList stories={stories.data.stories} />
            <Pagination total={stories.data.total}
                        pageSize={search.pagination.pageSize}
                        current={search.pagination.page}
                        onChange={(page, pageSize) => setSearch(s => ({ ...s, pagination: { page, pageSize } }))}
            />
          </>}
        </Flex>
      </main>
    </>
  );
};

export default withUser(Page);
export { getServerSideProps };
