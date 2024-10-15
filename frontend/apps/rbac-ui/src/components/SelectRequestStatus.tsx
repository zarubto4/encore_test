import { Radio, Select, SelectProps } from 'antd';
import { useEffect, useState } from 'react';

import { RoleRequestStatus } from '@vpcs/rbac-client';
import { ROLE_REQ_STATUS_DISPLAY } from '@/constants';
import useIsLargeScreen from '@/hooks/useIsLargeScreen';

type SelectRequestStatusProps = {
  onStatusChanged: (status: RoleRequestStatus) => void;
  selectedStatus?: RoleRequestStatus;
};

const SelectRequestStatus = ({ onStatusChanged, selectedStatus, ...restProps }: SelectRequestStatusProps) => {
  const isLargeScreen = useIsLargeScreen();
  const [status, setStatus] = useState<RoleRequestStatus | undefined>(selectedStatus);
  const options: SelectProps['options'] = [];

  (Object.keys(RoleRequestStatus) as Array<keyof typeof RoleRequestStatus>).forEach((key) => {
    options.push({
      label: ROLE_REQ_STATUS_DISPLAY[key],
      value: RoleRequestStatus[key],
    });
  });

  const handleChange = (status: RoleRequestStatus) => {
    setStatus(status);
    onStatusChanged(status);
  };

  useEffect(() => {
    setStatus(selectedStatus);
  }, [selectedStatus]);

  return (
    <>
      {isLargeScreen && (
        <Radio.Group onChange={(e) => handleChange(e.target.value)} value={status}>
          <Radio value="">All</Radio>
          {options.map((option) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
      )}
      {!isLargeScreen && (
        <Select
          allowClear
          style={{ width: '100%' }}
          onChange={(value) => handleChange(value)}
          placeholder="Select request status"
          options={options}
          value={status}
          optionFilterProp="label"
          {...restProps}
        />
      )}
    </>
  );
};

export default SelectRequestStatus;
