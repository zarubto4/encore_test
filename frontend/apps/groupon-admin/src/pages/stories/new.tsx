import { NextPage } from 'next';
import { Typography } from 'antd';

import Head from '@/components/Head';
import { withUser, getServerSideProps } from '@/hoc/withUser';
import { UploadStoryForm } from '@/components/UploadStoryForm';

const Page: NextPage = () => {
  const PAGE_TITLE = 'Upload new story';
  const { Title } = Typography;

  return (
    <>
      <Head title={PAGE_TITLE} />
      <Title level={2} className="my-0">
        {PAGE_TITLE}
      </Title>
      <UploadStoryForm />
    </>
  );
};

export default withUser(Page);
export { getServerSideProps };
