import { Card, Typography } from 'antd';
import RoleTitle from '@/components/typography/RoleTitle';
import type { CategoriesWithUser } from '@/types';

const { Text } = Typography;

type CategoryCardProps = {
  category: CategoriesWithUser;
};

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Card data-testid="category-card" size="small">
      <RoleTitle>{category.name}</RoleTitle>
      <Text>{category.description}</Text>
    </Card>
  );
};

export default CategoryCard;
