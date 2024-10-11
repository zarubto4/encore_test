/* eslint-disable react/display-name */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsersWithRole from '@/components/UsersWithRole';
import useFetchUsersRoles from '@/hooks/useFetchUsersRoles';
import { matchMedia } from '@/specs/matchMedia.spec';
import { useRouter } from 'next/router';

// Mock the AssignRoleToUserModal and RevokeRoleModal components
jest.mock('@/components/AssignRoleToUserModal', () => ({ role, isModalOpen, onCancel, onSuccess }) => (
  isModalOpen ? (
    <div>
      <p>Assign Role to User Modal</p>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={() => { onSuccess(); }}>Assign</button>
    </div>
  ) : null
));

jest.mock('@/components/RevokeRoleModal', () => ({ userRole, isModalOpen, onCancel, onSuccess }) => (
  isModalOpen ? (
    <div>
      <p>Revoke Role Modal</p>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={() => { onSuccess(); }}>Revoke</button>
    </div>
  ) : null
));

// Mock the useFetchUsersRoles hook
jest.mock('@/hooks/useFetchUsersRoles');

const mockUseFetchUsersRoles = useFetchUsersRoles;

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('UsersWithRole component', () => {
  const mockRole = {
    id: '1',
    name: 'Test Role',
  };

  const mockUserRoles = [
    {
      userId: '1',
      key: 'user-1',
      user: { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      scopeType: 'MERCHANT',
      scopeValue: '123',
    },
  ];

  const mockRouter = {
    query: {},
    push: jest.fn(),
    reload: jest.fn(),
  };

  beforeEach(() => {
    matchMedia();
    jest.clearAllMocks();
    mockUseFetchUsersRoles.mockReturnValue({ data: mockUserRoles, loading: false, error: null });
    (useRouter).mockReturnValue(mockRouter);
  });

  it('renders the component with users', () => {
    render(<UsersWithRole role={mockRole} />);

    expect(screen.getByText('Users with Role')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('MERCHANT')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('opens and closes the Assign Role to User modal', () => {
    render(<UsersWithRole role={mockRole} />);

    const assignButton = screen.getByRole('button', { name: 'Assign to user' });
    fireEvent.click(assignButton);
    expect(screen.getByText('Assign Role to User Modal')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Assign Role to User Modal')).not.toBeInTheDocument();
  });

  it('handles role assignment', async () => {
    render(<UsersWithRole role={mockRole} />);

    const assignButton = screen.getByRole('button', { name: 'Assign to user' });
    fireEvent.click(assignButton);

    const assignModalButton = screen.getByRole('button', { name: 'Assign' });
    fireEvent.click(assignModalButton);

    await waitFor(() => expect(mockRouter.reload).toHaveBeenCalled());
  });

  it('opens and closes the Revoke Role modal', () => {
    render(<UsersWithRole role={mockRole} />);

    const revokeButton = screen.getByRole('button', { name: 'Revoke role' });
    fireEvent.click(revokeButton);
    expect(screen.getByText('Revoke Role Modal')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Revoke Role Modal')).not.toBeInTheDocument();
  });

  it('handles role revocation', async () => {
    render(<UsersWithRole role={mockRole} />);

    const revokeButton = screen.getByRole('button', { name: 'Revoke role' });
    fireEvent.click(revokeButton);

    const revokeModalButton = screen.getByRole('button', { name: 'Revoke' });
    fireEvent.click(revokeModalButton);

    await waitFor(() => expect(mockRouter.reload).toHaveBeenCalled());
  });

  it('displays an error message when there is an error', () => {
    mockUseFetchUsersRoles.mockReturnValue({ data: null, loading: false, error: 'Error message' });

    render(<UsersWithRole role={mockRole} />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
