import { useState, useEffect } from 'react';
import { addKeyToData, handleError } from '@/utils';
import type { AuditLogWithUser, Pagination } from '@/types';
import { UserRegionType } from 'libs/users-client/src';

type FetchAuditLogParams = {
  page?: number;
  pageSize?: number;
  role?: string;
  permission?: string;
  user?: string;
  dateFrom?: string;
  dateTo?: string;
  type: string;
  affectedUser?: string;
  region?: UserRegionType;
};

const useFetchAuditLog = ({
  page = 1,
  pageSize = 20,
  role,
  permission,
  user,
  dateFrom,
  dateTo,
  type,
  affectedUser,
  region,
}: FetchAuditLogParams) => {
  const [data, setData] = useState<AuditLogWithUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page, pageSize });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setData([]);
      setError(null);
      if (!role && !permission && !user && !affectedUser) {
        return;
      }
      setLoading(true);
      try {
        const url = new URL('/api/rbac/audit', window.location.origin);
        const params: { [key: string]: string | undefined } = {
          role,
          permission,
          user,
          page: page.toString(),
          pageSize: pageSize.toString(),
          dateFrom,
          dateTo,
          type,
          affectedUser,
          region,
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
  }, [page, pageSize, role, permission, user, dateFrom, dateTo, type, affectedUser, region]);

  return { data, loading, error, pagination };
};

export default useFetchAuditLog;
