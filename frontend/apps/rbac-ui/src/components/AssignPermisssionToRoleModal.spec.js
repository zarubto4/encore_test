import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssignPermissionModal from '@/components/AssignPermisssionToRoleModal';

jest.mock('@/components/SelectPermissions', () => {
  const SelectPermissions = ({ onPermissionChange }) => (
    <select data-testid="select-permissions" onChange={(e) => onPermissionChange([e.target.value])}>
      <option value="perm1">Permission 1</option>
      <option value="perm2">Permission 2</option>
    </select>
  );
  SelectPermissions.displayName = 'SelectPermissions';
  return SelectPermissions;
});

jest.mock('@/components/RoleCard', () => {
  const RoleCard = ({ role }) => <div>Role: {role.name}</div>;
  RoleCard.displayName = 'RoleCard';
  return RoleCard;
});

jest.mock('@/components/SelectRoles', () => {
  const SelectRoles = ({ onRolesChange }) => (
    <select data-testid="select-roles" onChange={(e) => onRolesChange([e.target.value])}>
      <option value="role1">Role 1</option>
      <option value="role2">Role 2</option>
    </select>
  );
  SelectRoles.displayName = 'SelectRoles';
  return SelectRoles;
});

jest.mock('@/components/PermissionCard', () => {
  const PermissionCard = ({ permission }) => <div>Permission: {permission.code}</div>;
  PermissionCard.displayName = 'PermissionCard';
  return PermissionCard;
});

jest.mock('@/utils', () => ({
  handleError: jest.fn().mockImplementation((error) => error.message),
}));

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    error: jest.fn(),
  },
}));

const mockOnSuccess = jest.fn();
const mockOnCancel = jest.fn();

describe('AssignPermissionModal component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with correct title and buttons', () => {
    render(
      <AssignPermissionModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        role={{ id: 'role1', name: 'Role 1' }}
        permission={{ id: 'perm1', code: 'PERM1', description: 'Permission 1', createdBy: 'user1' }}
      />
    );

    expect(screen.getAllByText('Assign permission to role')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assign permission to role' })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <AssignPermissionModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables the Assign button when there are no roles or permissions selected', () => {
    render(
      <AssignPermissionModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
      />
    );

    const assignButton = screen.getByRole('button', { name: 'Assign permission to role' });
    expect(assignButton).toBeDisabled();
  });

  it('enables the Assign button when roles and permissions are selected', () => {
    render(
      <AssignPermissionModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        role={{ id: 'role1', name: 'Role 1' }}
        permission={{ id: 'perm1', code: 'PERM1', description: 'Permission 1', createdBy: 'user1' }}
      />
    );

    const assignButton = screen.getByRole('button', { name: 'Assign permission to role' });
    expect(assignButton).not.toBeDisabled();
  });

  it('handles permission assignment successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    render(
      <AssignPermissionModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        role={{ id: 'role1', name: 'Role 1' }}
        permission={{ id: 'perm1', code: 'PERM1', description: 'Permission 1', createdBy: 'user1' }}
      />
    );

    const assignButton = screen.getByRole('button', { name: 'Assign permission to role' });
    fireEvent.click(assignButton);

    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled());
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/rbac/roles',
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles: ['role1'], permissions: ['perm1'] }),
      })
    );
  });

  it('handles permission change correctly', () => {
    render(
      <AssignPermissionModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        role={{ id: 'role1', name: 'Role 1' }}
      />
    );

    const selectPermissions = screen.getByTestId('select-permissions');
    fireEvent.change(selectPermissions, { target: { value: 'perm2' } });

    const assignButton = screen.getByRole('button', { name: 'Assign permission to role' });
    expect(assignButton).not.toBeDisabled();
  });

  it('handles roles change correctly', () => {
    render(
      <AssignPermissionModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        permission={{ id: 'perm1', code: 'PERM1', description: 'Permission 1', createdBy: 'user1' }}
      />
    );

    const selectRoles = screen.getByTestId('select-roles');
    fireEvent.change(selectRoles, { target: { value: 'role2' } });

    const assignButton = screen.getByRole('button', { name: 'Assign permission to role' });
    expect(assignButton).not.toBeDisabled();
  });
});
