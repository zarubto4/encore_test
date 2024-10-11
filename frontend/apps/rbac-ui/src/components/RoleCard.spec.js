import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoleCard from '@/components/RoleCard';

const mockRole = {
  id: '1',
  name: 'Admin',
  description: 'Administrator role with all permissions.',
};

describe('RoleCard component', () => {
  it('renders the role card with correct role name and description', () => {
    render(<RoleCard role={mockRole} />);

    expect(screen.getByTestId('role-card')).toBeInTheDocument();
    expect(screen.getByTestId('role-title')).toHaveTextContent('Admin');
    expect(screen.getByTestId('role-card-description')).toHaveTextContent('Administrator role with all permissions.');
  });

  it('renders correctly when role description is empty', () => {
    const roleWithEmptyDescription = { ...mockRole, description: '' };
    render(<RoleCard role={roleWithEmptyDescription} />);

    expect(screen.getByTestId('role-card')).toBeInTheDocument();
    expect(screen.getByTestId('role-title')).toHaveTextContent('Admin');
    expect(screen.getByTestId('role-card-description')).toHaveTextContent('');
  });

  it('renders correctly when role name is empty', () => {
    const roleWithEmptyName = { ...mockRole, name: '' };
    render(<RoleCard role={roleWithEmptyName} />);

    expect(screen.getByTestId('role-card')).toBeInTheDocument();
    expect(screen.getByTestId('role-title')).toHaveTextContent('');
    expect(screen.getByTestId('role-card-description')).toHaveTextContent('Administrator role with all permissions.');
  });
});
