import { useState, useEffect } from 'react';
import { handleError } from '@/utils';
import type { CategoriesWithUser } from '@/types';

const useFetchCategory = (categoryId: string) => {
  const [data, setData] = useState<CategoriesWithUser>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;
      setLoading(true);
      setData(undefined);
      setError(null);
      try {
        const response = await fetch(`/api/rbac/categories/${categoryId}`);
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
  }, [categoryId]);

  return { data, loading, error };
};

export default useFetchCategory;
