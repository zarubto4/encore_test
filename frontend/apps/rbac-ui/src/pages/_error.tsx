import { NextPage, NextPageContext } from 'next';

interface ErrorPageProps {
  statusCode: number;
}

const ErrorPage: NextPage<ErrorPageProps> = ({ statusCode }) => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>{statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}</h1>
      <p>Sorry, something went wrong. Please try again later.</p>
    </div>
  );
};

ErrorPage.getInitialProps = async ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode: statusCode || 500 };
};

export default ErrorPage;
