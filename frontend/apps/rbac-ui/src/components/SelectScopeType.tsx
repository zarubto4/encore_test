import { Select, SelectProps } from 'antd';
import useFetchScopeTypes from '@/hooks/useFetchScopeTypes';
import { useState } from 'react';

type SelectPermissionsProps = {
  onChange: (scopeType: string) => void;
  selectedScopeType?: string;
};

const SelectScopeType: React.FC<SelectPermissionsProps> = ({ onChange, selectedScopeType = 'GLOBAL' }) => {
  const { data, loading } = useFetchScopeTypes();
  const [selected, setSelected] = useState<string | undefined>(selectedScopeType);

  const options: SelectProps['options'] =
    data?.map((scopeType) => ({
      value: scopeType.scopeType,
      label: scopeType.scopeType,
    })) || [];

  const handleChange = (scopeType: string) => {
    onChange(scopeType);
    setSelected(scopeType);
  };

  return (
    <Select
      disabled={loading}
      loading={loading}
      style={{ width: '100%' }}
      onChange={handleChange}
      placeholder="Select scope type"
      options={options}
      value={selected}
    />
  );
};

export default SelectScopeType;
