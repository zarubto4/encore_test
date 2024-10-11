import { useState, useEffect } from 'react';
import { addKeyToData, handleError } from '@/utils';
import type { RoleWithUser, Pagination } from '@/types';

type FetchRolesParams = {
  categoryId?: string;
  permissionId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  categories?: string[];
  permissions?: string[];
  deleted?: boolean;
  noPagination?: boolean;
};

const useFetchRoles = ({
  permissionId = undefined,
  page = 1,
  pageSize = 20,
  search = '',
  categories,
  permissions,
  deleted = false,
  noPagination = false,
  categoryId,
}: FetchRolesParams) => {
  const [data, setData] = useState<RoleWithUser[] | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page, pageSize });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData([]);
      setError(null);
      try {

        const url = new URL('/api/rbac/roles', window.location.origin);

        const params: { [key: string]: string | string[] } = {
          ...noPagination && { noPagination: String(noPagination) },
          ...!noPagination && { page: String(page), pageSize: String(pageSize) },
          ...(categoryId && { categories: [categoryId] }),
          ...(categories && { categories }),
          ...(permissionId && { permissions: [permissionId] }),
          ...(permissions && { permissions }),
          ...(search && { search }),
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
  }, [search, categories, permissionId, page, pageSize, deleted, noPagination, categoryId, permissions]);

  return { data, loading, error, pagination };
};

export default useFetchRoles;
