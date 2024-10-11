import { useState, useEffect } from 'react';

import { addKeyToData } from '@/utils';
import { handleError } from '@/utils';
import type { RoleOwnerWithUser } from '@/types';

const useFetchRoleOwners = (roleId: string, fetchKey: number) => {
  const [data, setData] = useState<RoleOwnerWithUser[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roleId) return;
    const fetchData = async () => {
      setLoading(true);
      setData([]);
      setError(null);
      try {
        const response = await fetch(`/api/rbac/roles/owners?roleId=${roleId}`);
        if (!response.ok) {
          const { message } = await response.json();
          throw new Error(message);
        }
        const result = await response.json();
        setData(result.map(addKeyToData));
      } catch (error) {
        setError(handleError(error));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId, fetchKey]);

  return { data, loading, error };
};

export default useFetchRoleOwners;
