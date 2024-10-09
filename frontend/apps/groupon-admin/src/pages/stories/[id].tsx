import { NextPage } from 'next';
import { Flex, Typography } from 'antd';
import Head from '@/components/Head';
import { getServerSideProps, withUser } from '@/hoc/withUser';
import { useRouter } from 'next/router';
import { StoryDetail } from '@/components/StoryDetail';

const PAGE_TITLE = 'Story detail';

const Page: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { Title } = Typography;

  return (
    <>
      <Head title={PAGE_TITLE} />
      <main>
        <Flex gap="middle" justify="space-between">
          <Title level={2} className="my-0">
            {PAGE_TITLE}
          </Title>
        </Flex>
        {id && <StoryDetail id={id as string} />}
      </main>
    </>
  );
};

export default withUser(Page);
export { getServerSideProps };
