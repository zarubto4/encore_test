export const getServerSideProps = async () => {
  return {
    redirect: {
      destination: '/requests',
      permanent: false,
    },
  };
};

export default getServerSideProps;
