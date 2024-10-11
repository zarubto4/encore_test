import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryCard from '@/components/CategoryCard';

const mockCategory = {
  id: '1',
  name: 'Category 1',
  description: 'This is the description for Category 1',
  createdBy: 'user1',
};

describe('CategoryCard component', () => {
  it('renders the card with correct category name and description', () => {
    render(<CategoryCard category={mockCategory} />);

    expect(screen.getByTestId('role-title')).toHaveTextContent('Category 1');
    expect(screen.getByText('This is the description for Category 1')).toBeInTheDocument();
  });

  it('renders the RoleTitle component with correct category name', () => {
    render(<CategoryCard category={mockCategory} />);

    expect(screen.getByTestId('role-title')).toHaveTextContent('Category 1');
  });

  it('renders the Text component with correct category description', () => {
    render(<CategoryCard category={mockCategory} />);

    expect(screen.getByText('This is the description for Category 1')).toBeInTheDocument();
  });
});
