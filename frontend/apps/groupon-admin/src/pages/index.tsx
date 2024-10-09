import { NextPage } from 'next';
import { Flex, Typography } from 'antd';

import Head from '@/components/Head';
import { withUser, getServerSideProps } from '@/hoc/withUser';

const PAGE_TITLE = 'Homepage';

const Page: NextPage = () => {
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
      </main>
    </>
  );
};

export default withUser(Page);
export { getServerSideProps };
