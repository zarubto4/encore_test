/* eslint-disable react/display-name */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RevokeRoleModal from '@/components/RevokeRoleModal';
import { message } from 'antd';
import { matchMedia } from '@/specs/matchMedia.spec';

beforeAll(matchMedia);

jest.mock('@/components/User', () => ({ show, twolines, userId, user }) => (
  <div data-testid="user-info">{`${user.name} (${user.email})`}</div>
));

jest.mock('@/components/typography/RoleTitle', () => ({ children }) => <div data-testid="role-title">{children}</div>);

jest.mock('@/utils', () => ({
  handleError: jest.fn().mockImplementation((error) => error.message),
}));

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockUserRole = {
  roleId: 'role1',
  userId: 'user1',
  scopeType: 'GLOBAL',
  scopeValue: '',
  user: { name: 'Test User', email: 'test@example.com' },
  role: { name: 'Test Role', description: 'Role description' },
};

const mockOnSuccess = jest.fn();
const mockOnCancel = jest.fn();

describe('RevokeRoleModal component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with correct title and user/role information', () => {
    render(
      <RevokeRoleModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        userRole={mockUserRole}
        type="my"
      />
    );

    const titles = screen.getAllByText('Leave role');
    expect(titles).toHaveLength(2); // One in the modal title and one in the button

    expect(screen.getByTestId('user-info')).toHaveTextContent('Test User (test@example.com)');
    expect(screen.getByTestId('role-title')).toHaveTextContent('Test Role');
    expect(screen.getByText('Role description')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <RevokeRoleModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        userRole={mockUserRole}
        type="my"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('submits the form and handles success', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    render(
      <RevokeRoleModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        userRole={mockUserRole}
        type="my"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /leave role/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/rbac/users/roles', expect.objectContaining({
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: mockUserRole.roleId,
          userId: mockUserRole.userId,
          scopeType: mockUserRole.scopeType,
          scopeValue: mockUserRole.scopeValue,
        }),
      }));
    });

    expect(message.success).toHaveBeenCalledWith('Role revoked successfully');
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('handles form submission failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Error message' }),
      })
    );

    render(
      <RevokeRoleModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        userRole={mockUserRole}
        type="my"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /leave role/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/rbac/users/roles', expect.objectContaining({
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: mockUserRole.roleId,
          userId: mockUserRole.userId,
          scopeType: mockUserRole.scopeType,
          scopeValue: mockUserRole.scopeValue,
        }),
      }));
    });

    expect(message.error).toHaveBeenCalledWith('Error message');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
