/* eslint-disable react/display-name */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RolesWithPermission from '@/components/RolesWithPermission';
import useFetchRoles from '@/hooks/useFetchRoles';
import { message } from 'antd';
import router from 'next/router';
import { matchMedia } from '@/specs/matchMedia.spec';

jest.mock('@/hooks/useFetchRoles');
jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  reload: jest.fn(),
  push: jest.fn(),
}));
jest.mock('@/components/User', () => ({ userId }) => <div data-testid="user">{userId}</div>);
jest.mock('@/components/AssignPermisssionToRoleModal', () => (props) => <div data-testid="assign-permission-modal" {...props}><button onClick={props.onSuccess}>Assign</button></div>);
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Modal: {
    confirm: jest.fn(({ onOk }) => onOk && onOk()),
  },
}));

const mockPermission = {
  id: 'perm1',
  code: 'PERMISSION_CODE',
  description: 'Permission description',
};

const mockRolesData = [
  {
    id: 'role1',
    name: 'Role 1',
    description: 'Description for Role 1',
    createdBy: 'user1',
    createdByUser: { name: 'User 1' },
    categories: [{ id: 'cat1', name: 'Category 1' }],
  },
  {
    id: 'role2',
    name: 'Role 2',
    description: 'Description for Role 2',
    createdBy: 'user2',
    createdByUser: { name: 'User 2' },
    categories: [{ id: 'cat1', name: 'Category 1' }],
  },
];

beforeAll(matchMedia);

describe('RolesWithPermission component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFetchRoles.mockReturnValue({ data: mockRolesData, error: null, loading: false });
  });

  it('renders the component with roles data', () => {
    render(<RolesWithPermission permission={mockPermission} />);

    expect(screen.getByText('Roles where this permission is assigned')).toBeInTheDocument();
    expect(screen.getByText('Role 1')).toBeInTheDocument();
    expect(screen.getByText('Role 2')).toBeInTheDocument();
  });

  it('handles role removal', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    render(<RolesWithPermission permission={mockPermission} />);

    fireEvent.click(screen.getAllByText('Remove from role')[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/rbac/roles/role1/permissions/perm1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith('Permission revoked successfully');
    });
  });

  it('handles role removal error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Error message' }),
      })
    );

    render(<RolesWithPermission permission={mockPermission} />);

    fireEvent.click(screen.getAllByText('Remove from role')[0]);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Error message');
    });
  });

  it('handles search correctly', () => {
    render(<RolesWithPermission permission={mockPermission} />);

    fireEvent.change(screen.getByPlaceholderText('Search by role name'), { target: { value: 'Role 1' } });

    expect(screen.queryByText('Role 2')).not.toBeInTheDocument();
    expect(screen.getByText('Role 1')).toBeInTheDocument();
  });

  it('shows the modal when Assign to role button is clicked', () => {
    render(<RolesWithPermission permission={mockPermission} />);

    fireEvent.click(screen.getByText('Assign to role'));

    expect(screen.getByTestId('assign-permission-modal')).toBeInTheDocument();
  });

  it('handles successful role assignment', async () => {
    render(<RolesWithPermission permission={mockPermission} />);

    fireEvent.click(screen.getByText('Assign to role'));

    expect(screen.getByTestId('assign-permission-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Assign', { selector: 'button' }));

    await waitFor(() => {
      expect(router.reload).toHaveBeenCalled();
    });
  });
});
