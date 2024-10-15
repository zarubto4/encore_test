import { useState, useEffect } from 'react';
import { handleError } from '@/utils';
import type { AccountSuccessResponse, UserRegionType } from '@vpcs/users-client';

const useFetchUser = (emails: string[] | undefined, region: UserRegionType) => {
  const [data, setData] = useState<AccountSuccessResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData([]);
      setError(null);
      try {
        const fetchUser = async (email: string) => {
          const response = await fetch(`/api/users/?email=${email}&region=${region}`);
          if (!response.ok) {
            const { message } = await response.json();
            return Promise.reject(message);
          }
          return response.json();
        };
        if (!emails) return;
        const results = await Promise.all(emails.map((email) => fetchUser(email)));
        setData(results);
        setError(null);
      } catch (error) {
        setError(handleError(error));
      } finally {
        setLoading(false);
      }
    };

    if (emails && emails.length > 0) {
      fetchData();
    } else {
      setLoading(false);
      setData([]);
    }
  }, [emails, region]);

  return { data, loading, error };
};

export default useFetchUser;
