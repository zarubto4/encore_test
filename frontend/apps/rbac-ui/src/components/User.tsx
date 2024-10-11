import { Spin } from 'antd';
import useFetchUser from '@/hooks/useFetchUser';
import { Tooltip } from 'antd';

import type { UserType } from 'libs/users-client/src';

type UserProps = {
  userId: string;
  showLoading?: boolean;
  showEmail?: boolean;
  showName?: boolean;
  show?: 'name' | 'email' | 'both' | undefined;
  user?: UserType;
  twolines?: boolean;
  tooltip?: boolean;
};

const handleUnresolvedUser = (userId: string) => {
  return (
    <Tooltip title={userId}>
      <span>Unresolved user</span>
    </Tooltip>
  );
};

const User = ({
  userId,
  showName = true,
  showEmail = false,
  show = undefined,
  user = undefined,
  twolines = false,
  tooltip = true,
}: UserProps) => {
  const { data, loading, error } = useFetchUser({ userId, user });

  if (loading) {
    return (
      <div data-testid="loading-user">
        <Spin />
      </div>
    );
  }

  if (error || !data || data.error) {
    return <div>{handleUnresolvedUser(userId)}</div>;
  }

  return (
    <div>
      {show === 'email' && data.email}
      {show === 'name' &&
        (tooltip ? (
          <Tooltip title={data.email}>
            {data.firstName} {data.lastName}
          </Tooltip>
        ) : (
          <>
            {data.firstName} {data.lastName}
          </>
        ))}
      {show === 'both' &&
        (twolines === true ? (
          <>
            <div style={{ fontWeight: 600 }}>
              {data.firstName} {data.lastName}
            </div>
            <div>{data.email}</div>
          </>
        ) : (
          <>
            {data.firstName} {data.lastName} {data.email}
          </>
        ))}
      {show === undefined && (
        <>
          {showName &&
            ((tooltip && (
              <Tooltip title={data.email}>
                {data.firstName} {data.lastName}
              </Tooltip>
            )) || (
              <>
                {data.firstName} {data.lastName}
              </>
            ))}
          {showEmail && data.email}
        </>
      )}
    </div>
  );
};

export default User;
