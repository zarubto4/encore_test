import { useState, useEffect } from 'react';
import { handleError } from '@/utils';

import type { PermissionWithUser } from '@/types';

const useFetchPermission = (permissionId: string) => {
  const [data, setData] = useState<PermissionWithUser>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData(undefined);
      setError(null);
      try {
        const response = await fetch(`/api/rbac/permissions/${permissionId}`);
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
  }, [permissionId]);

  return { data, loading, error };
};

export default useFetchPermission;
