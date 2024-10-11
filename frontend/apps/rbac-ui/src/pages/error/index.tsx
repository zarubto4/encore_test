import { ReactElement } from 'react';
import { Flex } from 'antd';

import CleanLayout from '@/components/CleanLayout';
import Head from '@/components/Head';

import type { NextPageWithLayout } from '@/pages/_app';

const GeneralError: NextPageWithLayout<{ email?: string }> = ({ email }) => {
  return (
    <>
      <Head title="General error" />
      <Flex style={{ height: '100vh' }} justify="center" align="center" gap="middle">
        <div className="text-center mx-10">
          <p>
            We&apos;re sorry, but there was an unexpected error.. Please contact us by using the &apos;Report
            Issue&apos; option.
          </p>
          <p>
            You can also try get to <a href="/">homepage</a> again.
          </p>
        </div>
      </Flex>
    </>
  );
};

GeneralError.getLayout = (page: ReactElement) => {
  return <CleanLayout>{page}</CleanLayout>;
};

export default GeneralError;
