import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PermissionCard from '@/components/PermissionCard';

describe('PermissionCard component', () => {
  const mockPermission = {
    id: '1',
    code: 'TEST_CODE',
    description: 'This is a test description',
  };

  it('renders the RoleTitle with the correct code', () => {
    render(<PermissionCard permission={mockPermission} />);

    const roleTitle = screen.getByTestId('role-title');
    expect(roleTitle).toBeInTheDocument();
    expect(roleTitle).toHaveTextContent(mockPermission.code);
  });

  it('renders the Text with the correct description', () => {
    render(<PermissionCard permission={mockPermission} />);

    const descriptionText = screen.getByText(mockPermission.description);
    expect(descriptionText).toBeInTheDocument();
  });
});
