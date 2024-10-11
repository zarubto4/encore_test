/* eslint-disable react/display-name */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RolesInSelectedCategory from '@/components/RolesInSelectedCategory';
import { message } from 'antd';
import useFetchRoles from '@/hooks/useFetchRoles';
import { matchMedia } from '@/specs/matchMedia.spec';

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  reload: jest.fn(),
}));

jest.mock('@/hooks/useFetchRoles');
jest.mock('@/components/User', () => ({ userId }) => <div data-testid="user">{userId}</div>);
jest.mock('@/components/AddCategoryModal', () => (props) => <div data-testid="add-category-modal" {...props} />);
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

const mockCategory = { id: 'cat1', name: 'Category 1' };

beforeAll(matchMedia);

describe('RolesInSelectedCategory component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFetchRoles.mockReturnValue({ data: mockRolesData, error: null, loading: false });
  });

  it('renders the component with roles data', () => {
    render(<RolesInSelectedCategory category={mockCategory} />);
    expect(screen.getByText('Roles where this category is assigned')).toBeInTheDocument();
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

    render(<RolesInSelectedCategory category={mockCategory} />);

    fireEvent.click(screen.getAllByText('Remove from here')[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/rbac/roles/role1/categories/cat1',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith('Role removed successfully');
    });
  });

  it('handles role removal error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Error message' }),
      })
    );

    render(<RolesInSelectedCategory category={mockCategory} />);

    fireEvent.click(screen.getAllByText('Remove from here')[0]);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Error message');
    });
  });

  it('handles search correctly', () => {
    render(<RolesInSelectedCategory category={mockCategory} />);

    fireEvent.change(screen.getByPlaceholderText('Search by role name'), { target: { value: 'Role 1' } });

    expect(screen.queryByText('Role 2')).not.toBeInTheDocument();
    expect(screen.getByText('Role 1')).toBeInTheDocument();
  });

  it('shows the modal when Assign to role button is clicked', () => {
    render(<RolesInSelectedCategory category={mockCategory} />);

    fireEvent.click(screen.getByText('Assign to role'));

    expect(screen.getByTestId('add-category-modal')).toBeInTheDocument();
  });
});
