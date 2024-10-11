import { useEffect, useState } from 'react';
import { Select } from 'antd';

import useFetchRoles from '@/hooks/useFetchRoles';

import type { SelectProps } from 'antd';

type SelectRolesProps = {
  onRolesChange: (roles: string[]) => void;
  hideRolesIds?: string[];
  showOnlyRolesIds?: string[];
  mode?: 'multiple' | 'tags';
  selected?: string[];
  allowClear?: boolean;
  disabled?: boolean;
  maxCount?: number;
  deleted?: boolean;
};

const SelectRoles = ({
  onRolesChange,
  hideRolesIds = [],
  showOnlyRolesIds = [],
  mode,
  selected,
  disabled = false,
  allowClear = true,
  maxCount,
  deleted = false,
}: SelectRolesProps) => {
  const { data, loading } = useFetchRoles({ noPagination: true, deleted });
  const [roles, setRoles] = useState<string[]>(selected ?? []);

  const options: SelectProps['options'] =
    data
      ?.filter((role) => showOnlyRolesIds.length === 0 || showOnlyRolesIds.includes(role.id))
      ?.filter((role) => !hideRolesIds?.includes(role.id))
      ?.map((role) => ({
        value: role.id,
        label: role.name,
      })) || [];

  const handleChange = (roles: string[]) => {
    setRoles(roles);
    onRolesChange(roles);
  };

  useEffect(() => {
    setRoles(selected ?? []);
  }, [selected]);

  return (
    <Select
      disabled={disabled || loading}
      loading={loading}
      style={{ width: '100%' }}
      filterOption={true}
      mode={mode}
      tokenSeparators={[',']}
      onChange={handleChange}
      onClear={() => handleChange([])}
      placeholder={`Select ${mode !== undefined ? 'roles' : 'role'}`}
      options={options}
      value={roles}
      optionFilterProp="label"
      allowClear={allowClear}
      maxCount={maxCount}
    />
  );
};

export default SelectRoles;
