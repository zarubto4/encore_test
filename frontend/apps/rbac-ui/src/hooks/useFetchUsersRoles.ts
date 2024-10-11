import { useState, useEffect } from 'react';
import { handleError } from '@/utils';
import { addKeyToData } from '@/utils';

import type { Pagination, UserRolesCreateResponseWithUser } from '@/types';

type UserFechRolesProps = {
  userIds?: string;
  roleIds?: string;
  fetchKey?: number;
  page?: number;
  pageSize?: number;
};

const useFetchUsersRoles = ({ userIds, roleIds, fetchKey, page = 1, pageSize = 10 }: UserFechRolesProps) => {
  const [data, setData] = useState<UserRolesCreateResponseWithUser[] | null>([]);
  const [pagination, setPagination] = useState<Pagination>({ page, pageSize });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData([]);
      setError(null);
      try {
        const url = new URL('/api/rbac/users/roles', window.location.origin);
        const params: { [key: string]: string | undefined } = {
          page: page.toString(),
          pageSize: pageSize.toString(),
          userIds,
          roleIds,
        };

        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            url.searchParams.append(key, value);
          }
        });

        const response = await fetch(url.toString());
        if (!response.ok) {
          const { message } = await response.json();
          throw new Error(message);
        }
        const { items, total } = await response.json();
        setData(items.map(addKeyToData));
        setPagination({ page, pageSize, total });
      } catch (error) {
        setError(handleError(error));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userIds, roleIds, fetchKey, page, pageSize]);

  return { data, loading, error, pagination };
};

export default useFetchUsersRoles;
