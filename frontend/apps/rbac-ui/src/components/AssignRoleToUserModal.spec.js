import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssignRoleToUserModal from '@/components/AssignRoleToUserModal';
import { message } from 'antd';
import { matchMedia } from '@/specs/matchMedia.spec';

beforeAll(matchMedia);

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

jest.mock('@/components/RoleCard', () => {
  const RoleCard = ({ role }) => <div>Role: {role.name}</div>;
  RoleCard.displayName = 'RoleCard';
  return RoleCard;
});

jest.mock('@/components/SelectUser', () => {
  const SelectUser = ({ onUsersChange }) => (
    <input
      data-testid="select-user"
      onChange={(e) => onUsersChange(e.target.value.split(','))}
      placeholder="Enter emails"
    />
  );
  SelectUser.displayName = 'SelectUser';
  return SelectUser;
});

jest.mock('@/components/SelectScopeType', () => {
  const SelectScopeType = ({ onChange }) => (
    <select data-testid="select-scope-type" onChange={(e) => onChange(e.target.value)}>
      <option value="GLOBAL">Global</option>
      <option value="SPECIFIC">Specific</option>
    </select>
  );
  SelectScopeType.displayName = 'SelectScopeType';
  return SelectScopeType;
});

jest.mock('@/utils', () => ({
  handleError: jest.fn().mockImplementation((error) => error.message),
  isValidEmail: jest.fn().mockImplementation((email) => /\S+@\S+\.\S+/.test(email)),
}));

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    error: jest.fn(),
  },
}));

const mockOnSuccess = jest.fn();
const mockOnCancel = jest.fn();

describe('AssignRoleToUserModal component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with correct title and buttons', () => {
    render(
      <AssignRoleToUserModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        role={{ id: 'role1', name: 'Role 1' }}
      />,
    );

    expect(screen.getByText('Assign role to user')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assign role' })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<AssignRoleToUserModal onSuccess={mockOnSuccess} onCancel={mockOnCancel} isModalOpen={true} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables the Assign button when there are no roles or emails selected', () => {
    render(<AssignRoleToUserModal onSuccess={mockOnSuccess} onCancel={mockOnCancel} isModalOpen={true} />);

    const assignButton = screen.getByRole('button', { name: 'Assign role' });
    expect(assignButton).toBeDisabled();
  });

  it('enables the Assign button when roles and emails are selected', () => {
    render(
      <AssignRoleToUserModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        role={{ id: 'role1', name: 'Role 1' }}
      />,
    );

    const selectUser = screen.getByTestId('select-user');
    fireEvent.change(selectUser, { target: { value: 'test@example.com' } });

    const assignButton = screen.getByRole('button', { name: 'Assign role' });
    expect(assignButton).not.toBeDisabled();
  });

  it('handles role assignment successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: [{ email: 'test@example.com' }], failed: [] }),
      }),
    );

    render(
      <AssignRoleToUserModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        role={{ id: 'role1', name: 'Role 1' }}
      />,
    );
    
    await act(async () => {
      const selectUser = screen.getByTestId('select-user');
      fireEvent.change(selectUser, { target: { value: 'test@example.com' } });

      const assignButton = screen.getByRole('button', { name: 'Assign role' });
      fireEvent.click(assignButton);
    });

    const closeButton = screen.getByTestId('assign-role-to-user-modal-close-button');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/rbac/users/roles',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roles: ['role1'],
          emails: ['test@example.com'],
          regions: ['NA'],
          scopeType: 'GLOBAL',
          comments: '',
        }),
      })
    );
  });

  it('handles role assignment failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Error message' }),
      })
    );

    render(
      <AssignRoleToUserModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        role={{ id: 'role1', name: 'Role 1' }}
      />
    );

    await act(async () => {
      const selectUser = screen.getByTestId('select-user');
      fireEvent.change(selectUser, { target: { value: 'test@example.com' } });

      const assignButton = screen.getByRole('button', { name: 'Assign role' });
      fireEvent.click(assignButton);
    });
    

    await waitFor(() => expect(message.error).toHaveBeenCalledWith('Error message'));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/rbac/users/roles',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roles: ['role1'],
          emails: ['test@example.com'],
          regions: ['NA'],
          scopeType: 'GLOBAL',
          comments: '',
        }),
      })
    );
  });

  it('handles roles change correctly', async () => {
    render(
      <AssignRoleToUserModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
      />
    );

    await act(async () => {
      const selectRoles = screen.getByTestId('select-roles');
      fireEvent.change(selectRoles, { target: { value: 'role2' } });

      const selectUser = screen.getByTestId('select-user');
      fireEvent.change(selectUser, { target: { value: 'test@example.com' } });
    });

    const assignButton = screen.getByRole('button', { name: 'Assign role' });
    expect(assignButton).not.toBeDisabled();
  });

  it('handles email change correctly', () => {
    render(
      <AssignRoleToUserModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        role={{ id: 'role1', name: 'Role 1' }}
      />
    );

    const selectUser = screen.getByTestId('select-user');
    fireEvent.change(selectUser, { target: { value: 'test@example.com' } });

    const assignButton = screen.getByRole('button', { name: 'Assign role' });
    expect(assignButton).not.toBeDisabled();
  });

  it('handles scope type change correctly', () => {
    render(
      <AssignRoleToUserModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        role={{ id: 'role1', name: 'Role 1' }}
      />
    );

    const selectScopeType = screen.getByTestId('select-scope-type');
    fireEvent.change(selectScopeType, { target: { value: 'SPECIFIC' } });

    expect(screen.getByPlaceholderText('Enter scope value')).toBeInTheDocument();
  });

  it('handles form submission with specific scope correctly', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: [{ email: 'test@example.com' }], failed: [] }),
      })
    );

    render(
      <AssignRoleToUserModal
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        isModalOpen={true}
        role={{ id: 'role1', name: 'Role 1' }}
      />
    );

    await act(async () => {
      
      const selectUser = screen.getByTestId('select-user');
      fireEvent.change(selectUser, { target: { value: 'test@example.com' } });

      const selectScopeType = screen.getByTestId('select-scope-type');
      fireEvent.change(selectScopeType, { target: { value: 'SPECIFIC' } });

      const scopeValueInput = screen.getByPlaceholderText('Enter scope value');
      fireEvent.change(scopeValueInput, { target: { value: 'specificScope' } });

      const commentValueInput = screen.getByPlaceholderText('Describe reason');
      fireEvent.change(commentValueInput, { target: { value: 'Test reason' } });

      const assignButton = screen.getByRole('button', { name: 'Assign role' });
      fireEvent.click(assignButton);
    });

    const closeButton = screen.getByTestId('assign-role-to-user-modal-close-button');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/rbac/users/roles',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roles: ['role1'],
          emails: ['test@example.com'],
          regions: ['NA'],
          scopeType: 'SPECIFIC',
          comments: 'Test reason',
          scopeValue: 'specificScope',
        }),
      })
    );
  });
});
