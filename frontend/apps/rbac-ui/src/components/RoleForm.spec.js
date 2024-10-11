/* eslint-disable react/display-name */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoleForm from '@/components/RoleForm';
import { message } from 'antd';
import { handleError } from '@/utils';
import router from 'next/router';
import { matchMedia } from '@/specs/matchMedia.spec';

jest.mock('@/components/DeleteButton', () => ({ userRole, size, disabled, onOk }) => (
  <button data-testid="delete-button" onClick={() => onOk()} disabled={disabled}>Delete</button>
));

jest.mock('@/components/CloneRoleButton', () => ({ userRole, disabled }) => (
  <button data-testid="clone-role-button" disabled={disabled}>Clone Role</button>
));

jest.mock('@/components/SelectCategories', () => ({ disabled, initialCategories, onCategoriesChange }) => (
  <select data-testid="select-categories" multiple disabled={disabled} onChange={(e) => onCategoriesChange(Array.from(e.target.selectedOptions, option => option.value))}>
    <option value="cat1">Category 1</option>
    <option value="cat2">Category 2</option>
  </select>
));

jest.mock('@/components/SelectPermissions', () => ({ mode, onPermissionChange }) => (
  <select data-testid="select-permissions" multiple onChange={(e) => onPermissionChange(Array.from(e.target.selectedOptions, option => option.value))}>
    <option value="perm1">Permission 1</option>
    <option value="perm2">Permission 2</option>
  </select>
));

jest.mock('@/components/User', () => ({ show, userId, user }) => (
  <div data-testid="user-info">{user.name} ({user.email})</div>
));

jest.mock('@/components/RoleRequestModal', () => ({ role, myRolesIds, isModalOpen, onSuccess, onCancel }) => (
  isModalOpen ? (
    <div data-testid="role-request-modal">
      <button data-testid="cancel-request-modal" onClick={onCancel}>Cancel</button>
      <button data-testid="success-request-modal" onClick={onSuccess}>Success</button>
    </div>
  ) : null
));

jest.mock('@/utils', () => ({
  handleError: jest.fn().mockImplementation((error) => error.message),
  formatDateString: jest.fn().mockReturnValue('2023-01-01 00:00:00')
}));

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  reload: jest.fn(),
  push: jest.fn(),
}));

jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    message: {
      ...antd.message,
      error: jest.fn(),
    },
  };
});

beforeAll(matchMedia);

const mockRole = {
  id: '1',
  name: 'Admin',
  description: 'Administrator role with all permissions.',
  categories: [{ id: 'cat1', name: 'Category 1' }],
  createdAt: '2023-01-01T00:00:00Z',
  createdBy: 'user1',
  createdByUser: { name: 'Admin User', email: 'admin@example.com' },
};

const mockOnSuccessfulSubmit = jest.fn();
const mockOnSuccessfulDelete = jest.fn();

describe('RoleForm component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with role data', () => {
    render(<RoleForm role={mockRole} onSuccessfulSubmit={mockOnSuccessfulSubmit} onSuccessfulDelete={mockOnSuccessfulDelete} />);

    expect(screen.getByDisplayValue('Admin')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Administrator role with all permissions.')).toBeInTheDocument();
    expect(screen.getByText('2023-01-01 00:00:00')).toBeInTheDocument();
    expect(screen.getByTestId('user-info')).toHaveTextContent('Admin User (admin@example.com)');
  });

  it('calls onSuccessfulSubmit after form submission', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    render(<RoleForm role={mockRole} onSuccessfulSubmit={mockOnSuccessfulSubmit} onSuccessfulDelete={mockOnSuccessfulDelete} />);

    fireEvent.change(screen.getByLabelText(/role name/i), { target: { value: 'Admin Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSuccessfulSubmit).toHaveBeenCalled();
    });
  });

  it('calls onSuccessfulDelete after deleting the role', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    render(<RoleForm role={mockRole} onSuccessfulSubmit={mockOnSuccessfulSubmit} onSuccessfulDelete={mockOnSuccessfulDelete} />);

    fireEvent.click(screen.getByTestId('delete-button'));

    await waitFor(() => {
      expect(mockOnSuccessfulDelete).toHaveBeenCalled();
    });
  });

  it('shows the role request modal and handles success and cancel actions', () => {
    render(<RoleForm role={mockRole} onSuccessfulSubmit={mockOnSuccessfulSubmit} onSuccessfulDelete={mockOnSuccessfulDelete} disabled />);

    fireEvent.click(screen.getByRole('button', { name: /request role/i }));
    expect(screen.getByTestId('role-request-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('cancel-request-modal'));
    expect(screen.queryByTestId('role-request-modal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /request role/i }));
    fireEvent.click(screen.getByTestId('success-request-modal'));

    expect(router.push).toHaveBeenCalled();
  });

  it('handles form submission failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Error message' }),
      })
    );

    render(<RoleForm role={mockRole} onSuccessfulSubmit={mockOnSuccessfulSubmit} onSuccessfulDelete={mockOnSuccessfulDelete} />);

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Error message');
    });
  });

  it('handles category change', () => {
    render(<RoleForm role={mockRole} />);

    fireEvent.change(screen.getByTestId('select-categories'), { target: { value: 'cat2' } });

    expect(screen.getByTestId('select-categories')).toHaveValue(['cat2']);
  });

  it('handles permission change', () => {
    render(<RoleForm />);

    fireEvent.change(screen.getByTestId('select-permissions'), { target: { value: 'perm2' } });

    expect(screen.getByTestId('select-permissions')).toHaveValue(['perm2']);
  });
});
