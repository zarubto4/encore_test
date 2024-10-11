import { useState, useEffect } from 'react';
import { handleError, addKeyToData } from '@/utils';
import type { OwnerRoleRequest, Pagination } from '@/types';
import { RoleRequestStatus } from 'libs/rbac-client/src';

type RoleRequestParams = {
  requesterId?: string;
  roleOwnerId?: string;
  roleId?: string;
  status?: RoleRequestStatus;
  page?: number;
  pageSize?: number;
};

const useFetchRoleRequests = ({
  requesterId,
  roleOwnerId,
  roleId,
  status,
  page = 1,
  pageSize = 10,
}: RoleRequestParams) => {
  const [data, setData] = useState<OwnerRoleRequest[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page, pageSize });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData([]);
      setError(null);
      try {
        const url = new URL('/api/rbac/roles/requests', window.location.origin);
        const params: { [key: string]: string | undefined } = {
          requesterId,
          roleOwnerId,
          roleId,
          status,
          page: page.toString(),
          pageSize: pageSize.toString(),
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
        setPagination({ page, pageSize, total });
        setData(items.map(addKeyToData));
      } catch (error) {
        setError(handleError(error));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requesterId, roleOwnerId, roleId, status, page, pageSize]);

  return { data, loading, error, pagination };
};

export default useFetchRoleRequests;
