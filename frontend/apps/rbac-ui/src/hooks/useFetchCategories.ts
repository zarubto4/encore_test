import { useState, useEffect } from 'react';
import { addKeyToData } from '@/utils';
import { handleError } from '@/utils';
import type { CategoriesWithUser } from '@/types';

const useFetchCategories = () => {
  const [data, setData] = useState<CategoriesWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData([]);
      setError(null);
      try {
        const response = await fetch('/api/rbac/categories');
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
  }, []);

  return { data, loading, error };
};

export default useFetchCategories;
