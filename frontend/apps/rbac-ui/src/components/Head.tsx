import Head from 'next/head';

type HeadProps = {
  title: string;
};

export default function HeadComponent({ title }: HeadProps): JSX.Element {
  return (
    <Head>
      <title>{`${title} | RBAC UI`}</title>
    </Head>
  );
}
