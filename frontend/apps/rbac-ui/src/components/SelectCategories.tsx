import { Select, SelectProps } from 'antd';
import useFetchCategories from '@/hooks/useFetchCategories';
import { useEffect, useState } from 'react';

type SelectCategoriesProps = {
  onCategoriesChange: (categories: string[]) => void;
  initialCategories?: string[];
  placeholder?: string;
  disabled?: boolean;
};

const SelectCategories = ({
  onCategoriesChange,
  initialCategories = [],
  placeholder,
  ...restProps
}: SelectCategoriesProps) => {
  const { data, loading } = useFetchCategories();
  const [categories, setCategories] = useState<string[]>(initialCategories);

  const options: SelectProps['options'] =
    data?.map((category) => ({
      value: category.id,
      label: category.name,
    })) || [];

  const handleChange = (selectedCategories: string[]) => {
    setCategories(selectedCategories);
    onCategoriesChange(selectedCategories);
  };
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  return (
    <Select
      disabled={loading}
      loading={loading}
      style={{ width: '100%' }}
      filterOption={true}
      mode="multiple"
      tokenSeparators={[',']}
      onChange={handleChange}
      placeholder={placeholder ? placeholder : 'Select categorie(s)'}
      options={options}
      value={categories}
      optionFilterProp="label"
      allowClear
      {...restProps}
    />
  );
};

export default SelectCategories;
