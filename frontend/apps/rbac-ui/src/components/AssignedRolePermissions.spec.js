import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssignedRolePermissions from '@/components/AssignedRolePermissions';
import { matchMedia } from '@/specs/matchMedia.spec';

// Mocking AssignPermissionModal component
jest.mock('@/components/AssignPermisssionToRoleModal', () => {
  const AssignPermisssionToRoleModal = ({ role, isModalOpen, onCancel, onSuccess }) => (
    isModalOpen ? (
      <div>
        <p>Assign Permission Modal</p>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={() => { onSuccess(); }}>Assign</button>
      </div>
    ) : null
  );
  AssignPermisssionToRoleModal.displayName = 'AssignPermisssionToRoleModal';
  return AssignPermisssionToRoleModal;
});

// Mocking User component
jest.mock('@/components/User', () => {
  const User = ({ userId }) => <span>User: {userId}</span>;
  User.displayName = 'User';
  return User;
});

beforeAll(matchMedia);

describe('AssignedRolePermissions component', () => {
  const mockRole = {
    id: '1',
    name: 'Test Role',
    permissions: [
      {
        id: 'perm1',
        code: 'PERM1',
        description: 'Permission 1',
        categories: [{ id: 'cat1', name: 'Category 1' }],
        createdBy: 'user1',
      },
    ],
  };

  const mockOnAssignedPermission = jest.fn();
  const mockOnRevokePermission = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the table with permissions', () => {
    render(
      <AssignedRolePermissions
        role={mockRole}
        onAssignedPermission={mockOnAssignedPermission}
        onRevokePermission={mockOnRevokePermission}
      />
    );

    expect(screen.getByText('Assigned permissions')).toBeInTheDocument();
    expect(screen.getByText('PERM1')).toBeInTheDocument();
    expect(screen.getByText('Permission 1')).toBeInTheDocument();
    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('User: user1')).toBeInTheDocument();
  });

  it('opens and closes the Assign Permission modal', () => {
    render(
      <AssignedRolePermissions
        role={mockRole}
        onAssignedPermission={mockOnAssignedPermission}
        onRevokePermission={mockOnRevokePermission}
      />
    );

    const assignButton = screen.getByRole('button', { name: 'Assign permission' });
    fireEvent.click(assignButton);
    expect(screen.getByText('Assign Permission Modal')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Assign Permission Modal')).not.toBeInTheDocument();
  });

  it('handles permission assignment', async () => {
    render(
      <AssignedRolePermissions
        role={mockRole}
        onAssignedPermission={mockOnAssignedPermission}
        onRevokePermission={mockOnRevokePermission}
      />
    );

    const assignButton = screen.getByRole('button', { name: 'Assign permission' });
    fireEvent.click(assignButton);

    const assignModalButton = screen.getByRole('button', { name: 'Assign' });
    fireEvent.click(assignModalButton);

    await waitFor(() => expect(mockOnAssignedPermission).toHaveBeenCalled());
  });

  it('handles permission revocation', async () => {
    const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({}) };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    render(
      <AssignedRolePermissions
        role={mockRole}
        onAssignedPermission={mockOnAssignedPermission}
        onRevokePermission={mockOnRevokePermission}
      />
    );

    const revokeButton = screen.getByRole('button', { name: 'Revoke permission' });
    fireEvent.click(revokeButton);

    await waitFor(() => expect(document.querySelector('.ant-modal-mask')).toBeInTheDocument());

    // Confirm the modal
    const confirmButton = screen.getByRole('button', { name: 'OK' });
    fireEvent.click(confirmButton);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      `/api/rbac/roles/${mockRole.id}/permissions/${mockRole.permissions[0].id}`,
      expect.objectContaining({ method: 'DELETE' })
    ));
    await waitFor(() => expect(mockOnRevokePermission).toHaveBeenCalled());
  }, 10000);
});
