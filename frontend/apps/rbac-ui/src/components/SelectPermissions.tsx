import { Select, SelectProps, Spin } from 'antd';
import useFetchPermissions from '@/hooks/useFetchPermissions';
import { useEffect, useState } from 'react';

import type { RolesResponse } from 'libs/rbac-client/src';

type SelectPermissionsProps = {
  onPermissionChange: (roles: string[]) => void;
  initialPermissions?: string[];
  role?: RolesResponse;
  mode?: 'multiple' | 'tags';
  allowClear?: boolean;
  maxCount?: number;
  deleted?: boolean;
};

let debounceSearchTimer: NodeJS.Timeout | null = null;

const SelectPermissions: React.FC<SelectPermissionsProps> = ({
  onPermissionChange,
  initialPermissions,
  role,
  mode,
  allowClear = true,
  maxCount,
  deleted = false,
}) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const { data, loading } = useFetchPermissions({ search: searchValue, noPagination: true, deleted });
  const [permissions, setPermissions] = useState<string[]>(initialPermissions ?? []);

  const existingPermissions = role?.permissions?.map((permission) => permission.id) ?? [];
  const filteredData = data?.filter((permission) => !existingPermissions.includes(permission.id));

  const options: SelectProps['options'] =
    filteredData?.map((permission) => ({
      value: permission.id,
      label: permission.code,
    })) || [];

  const handleChange = (selectedPermissions: string[]) => {
    setPermissions(selectedPermissions);
    onPermissionChange(selectedPermissions);
  };

  const handleSearch = (value: string) => {
    if (debounceSearchTimer) {
      clearTimeout(debounceSearchTimer);
      debounceSearchTimer = null;
    }
    debounceSearchTimer = setTimeout(() => {
      setSearchValue(value);
    }, 300);
  };

  useEffect(() => {
    setPermissions(initialPermissions ?? []);
  }, [initialPermissions]);

  return (
    <Select
      autoClearSearchValue={false}
      style={{ width: '100%' }}
      mode={mode}
      tokenSeparators={[',']}
      onChange={handleChange}
      onSearch={handleSearch}
      onClear={() => handleChange([])}
      placeholder={`Select ${mode !== undefined ? 'permissions' : 'permission'}`}
      options={options}
      value={permissions}
      optionFilterProp="label"
      allowClear={allowClear}
      maxCount={maxCount}
      notFoundContent={loading ? <Spin size="small" /> : null}
      showSearch={true}
    />
  );
};

export default SelectPermissions;
