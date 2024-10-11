import { useState, useEffect } from 'react';
import { handleError } from '@/utils';
import type { UserType } from '@vpcs/users-client';

type UseFetchUserParams = {
  userId: string | undefined | null;
  user?: UserType;
};

const useFetchUser = ({ userId, user }: UseFetchUserParams) => {
  const [data, setData] = useState<UserType>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || user) {
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setData(undefined);
      setError(null);
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          const { message } = await response.json();
          throw new Error(message);
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(handleError(error));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userId]);

  if (user) {
    return { data: user, loading: false, error: null };
  }

  return { data, loading, error };
};

export default useFetchUser;
