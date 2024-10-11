/* eslint-disable react/display-name */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PermissionInSelectedCategory from '@/components/PermissionInSelectedCategory';
import useFetchPermissions from '@/hooks/useFetchPermissions';
import { matchMedia } from '@/specs/matchMedia.spec';

beforeAll(matchMedia);

jest.mock('@/hooks/useFetchPermissions');
jest.mock('@/components/AddCategoryModal', () => (props) => <div data-testid="add-category-modal" {...props} />);
jest.mock('@/utils', () => ({
  handleError: jest.fn(),
}));
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

const mockCategory = {
  id: '1',
  name: 'Test Category',
};

const mockPermissions = [
  {
    id: '1',
    code: 'PERMISSION_1',
    description: 'Permission 1 Description',
    categories: [{ id: '1', name: 'Test Category' }],
    createdBy: 'user1',
    createdByUser: { id: 'user1', name: 'User 1' },
  },
  {
    id: '2',
    code: 'PERMISSION_2',
    description: 'Permission 2 Description',
    categories: [{ id: '1', name: 'Test Category' }],
    createdBy: 'user2',
    createdByUser: { id: 'user2', name: 'User 2' },
  },
];

describe('PermissionInSelectedCategory component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title and "Assign to permission" button', () => {
    useFetchPermissions.mockReturnValue({ data: mockPermissions, error: null, loading: false });

    render(<PermissionInSelectedCategory category={mockCategory} />);

    expect(screen.getByText('Permissions where this category is assigned')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assign to permission' })).toBeInTheDocument();
  });

  it('displays an error message if useFetchPermissions returns an error', () => {
    useFetchPermissions.mockReturnValue({ data: null, error: 'Failed to fetch permissions', loading: false });

    render(<PermissionInSelectedCategory category={mockCategory} />);

    expect(screen.getByText('Failed to fetch permissions')).toBeInTheDocument();
  });

  it('displays a list of permissions', () => {
    useFetchPermissions.mockReturnValue({ data: mockPermissions, error: null, loading: false });

    render(<PermissionInSelectedCategory category={mockCategory} />);

    expect(screen.getByText('PERMISSION_1')).toBeInTheDocument();
    expect(screen.getByText('Permission 1 Description')).toBeInTheDocument();
    expect(screen.getByText('PERMISSION_2')).toBeInTheDocument();
    expect(screen.getByText('Permission 2 Description')).toBeInTheDocument();
  });

  it('filters the permissions list based on search input', () => {
    useFetchPermissions.mockReturnValue({ data: mockPermissions, error: null, loading: false });

    render(<PermissionInSelectedCategory category={mockCategory} />);

    const searchInput = screen.getByPlaceholderText('Search by permission code');
    fireEvent.change(searchInput, { target: { value: 'PERMISSION_1' } });

    expect(screen.getByText('PERMISSION_1')).toBeInTheDocument();
    expect(screen.queryByText('PERMISSION_2')).not.toBeInTheDocument();
  });

  it('opens and closes the AddCategoryModal', () => {
    useFetchPermissions.mockReturnValue({ data: mockPermissions, error: null, loading: false });

    render(<PermissionInSelectedCategory category={mockCategory} />);

    const assignButton = screen.getByRole('button', { name: 'Assign to permission' });
    fireEvent.click(assignButton);

    expect(screen.getByTestId('add-category-modal')).toBeInTheDocument();

  });
});
