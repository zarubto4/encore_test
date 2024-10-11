/* eslint-disable react/display-name */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RolesTableAll from '@/components/RolesTableAll';
import useFetchRoles from '@/hooks/useFetchRoles';
import { matchMedia } from '@/specs/matchMedia.spec';
import { UserEnum } from '@/types';

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    query: {},
    push: jest.fn(),
    reload: jest.fn(),
  }),
}));

jest.mock('@/hooks/useFetchRoles');
jest.mock('@/components/User', () => ({ userId }) => <div data-testid="user">{userId}</div>);
jest.mock('@/components/AssignRoleToUserModal', () => (props) => <div data-testid="assign-role-modal" {...props} />);
jest.mock('@/components/RoleRequestModal', () => (props) => <div data-testid="role-request-modal" {...props} />);
jest.mock('@/components/SelectCategories', () => ({ disabled, initialCategories, onCategoriesChange }) => (
  <select data-testid="select-categories" multiple disabled={disabled} onChange={(e) => onCategoriesChange(Array.from(e.target.selectedOptions, option => option.value))}>
    <option value="cat1">Category 1</option>
    <option value="cat2">Category 2</option>
  </select>
));
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

describe('RolesTableAll component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFetchRoles.mockReturnValue({ data: mockRolesData, error: null, loading: false, pagination: { page: 1, pageSize: 10, total: 2 } });
  });

  it('renders the component with roles data', () => {
    render(<RolesTableAll myRolesIds={['role1']} type={UserEnum.USER} />);
    
    expect(screen.getByText('All roles')).toBeInTheDocument();
    expect(screen.getByText('Role 1')).toBeInTheDocument();
    expect(screen.getByText('Role 2')).toBeInTheDocument();
  });

  it('handles role assignment modal opening for admin', () => {
    render(<RolesTableAll myRolesIds={['role1']} type={UserEnum.ADMIN} />);

    fireEvent.click(screen.getAllByText('Assign')[0]);

    expect(screen.getByTestId('assign-role-modal')).toBeInTheDocument();
  });

  it('handles role request modal opening for user', () => {
    render(<RolesTableAll myRolesIds={['role1']} type={UserEnum.USER} />);

    fireEvent.click(screen.getAllByText('Request')[1]);

    expect(screen.getByTestId('role-request-modal')).toBeInTheDocument();
  });

  it('handles search input change and debounce', async () => {
    const router = require('next/router').useRouter();
    render(<RolesTableAll myRolesIds={['role1']} type={UserEnum.USER} />);

    fireEvent.change(screen.getByPlaceholderText('Search by role name'), { target: { value: 'Role 2' } });

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith({
        query: expect.objectContaining({
          page: 1,
          search: 'Role 2',
        }),
      });
    });
  });

  it('handles categories change', async () => {
    const router = require('next/router').useRouter();
    render(<RolesTableAll myRolesIds={['role1']} type={UserEnum.USER} />);

    fireEvent.click(screen.getByTestId('select-categories'));

    // Mock selection of a category
    fireEvent.change(screen.getByTestId('select-categories'), { target: { value: ['cat1'] } });

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith({
        query: expect.objectContaining({
          page: 1,
          categories: ['cat1'],
        }),
      });
    });
  });
});
