import { useState, useEffect } from 'react';
import { handleError } from '@/utils';
import type { RoleWithUser } from '@/types';

const useFetchRole = (roleId: string) => {
  const [data, setData] = useState<RoleWithUser>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roleId) return;
    const fetchData = async () => {
      setLoading(true);
      setData(undefined);
      setError(null);
      try {
        const response = await fetch(`/api/rbac/roles/${roleId}`);
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
  }, [roleId]);

  return { data, loading, error };
};

export default useFetchRole;
