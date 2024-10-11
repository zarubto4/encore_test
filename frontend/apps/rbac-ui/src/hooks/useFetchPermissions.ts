import { useState, useEffect } from 'react';
import { addKeyToData, handleError } from '@/utils';
import type { Pagination, PermissionWithUser } from '@/types';

type UseFetchPermissionsProps = {
  categoryId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  categories?: string[];
  noPagination?: boolean;
  deleted?: boolean;
};

const useFetchPermissions = ({
  categoryId,
  page = 1,
  pageSize = 20,
  search = '',
  categories,
  noPagination = false,
  deleted = false,
}: UseFetchPermissionsProps) => {
  const [data, setData] = useState<PermissionWithUser[] | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page, pageSize });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData([]);
      setError(null);

      try {
        const url = new URL('/api/rbac/permissions', window.location.origin);

        const params: { [key: string]: string | string[] } = {
          ...noPagination && { noPagination: String(noPagination) },
          ...!noPagination && { page: String(page), pageSize: String(pageSize) },
          ...(categoryId && { categories: [categoryId] }),
          ...(search && { search }),
          ...(categories && { categories }),
          ...(deleted && { show: 'deleted' }),
        };

        Object.keys(params).forEach((key) => {
          const value = params[key];
          if (Array.isArray(value)) {
            value.forEach((item) => url.searchParams.append(key, item));
          } else {
            url.searchParams.append(key, value);
          }
        });

        const response = await fetch(url.toString());
        if (!response.ok) {
          const { message } = await response.json();
          throw new Error(message);
        }

        const { items, total } = await response.json();
        setPagination({ page, pageSize, total });
        setData(items.map(addKeyToData));
      } catch (error) {
        setError(handleError(error));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, page, pageSize, search, categories, noPagination, deleted]);

  return { data, loading, error, pagination };
};

export default useFetchPermissions;
