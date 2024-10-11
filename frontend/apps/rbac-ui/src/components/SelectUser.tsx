import { Select, SelectProps } from 'antd';
import { useEffect, useState } from 'react';
import { isValidEmail } from '@/utils';

type SelectUserProps = {
  onUsersChange: (emails: string[]) => void;
  initialEmails?: string[];
  maxCount?: number;
};

const SelectUser: React.FC<SelectUserProps> = ({ onUsersChange, initialEmails, maxCount }) => {
  const [emails, setEmails] = useState<string[]>(initialEmails || []);
  const [options, setOptions] = useState<SelectProps['options']>(
    initialEmails?.map((email) => ({ value: email, label: email })),
  );

  const handleSelect = (email: string) => {
    const trimmedEmail = email.trim();
    if (isValidEmail(trimmedEmail) && !options?.some((option) => option.value === email)) {
      const newEmail = { value: trimmedEmail, label: trimmedEmail };
      setOptions(options?.length ? [...options, newEmail] : [newEmail]);
    }
  };

  const handleChange = (newEmails: string[]) => {
    const filteredEmails = newEmails.map((e) => e.trim()).filter(isValidEmail);
    setEmails(filteredEmails);
    onUsersChange(filteredEmails);
  };

  useEffect(() => {
    setEmails(initialEmails ?? []);
  }, [initialEmails]);

  return (
    <Select
      style={{ width: '100%' }}
      filterOption={true}
      mode="tags"
      tokenSeparators={[',']}
      onChange={handleChange}
      onSelect={handleSelect}
      placeholder="email@groupon.com"
      options={options}
      value={emails}
      optionFilterProp="value"
      notFoundContent={null}
      maxCount={maxCount}
    />
  );
};

export default SelectUser;
