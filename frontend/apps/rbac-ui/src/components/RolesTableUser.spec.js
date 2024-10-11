/* eslint-disable react/display-name */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RolesTableUser from '@/components/RolesTableUser';
import useFetchUsersRoles from '@/hooks/useFetchUsersRoles';
import { useRouter } from 'next/router';
import { matchMedia } from '@/specs/matchMedia.spec';

jest.mock('@/hooks/useFetchUsersRoles');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
  push: jest.fn(),
  reload: jest.fn(),
}));
jest.mock('@/components/RevokeRoleModal', () => (props) => <div data-testid="revoke-role-modal" {...props} />);
jest.mock('@/components/User', () => ({ userId }) => <div data-testid="user">{userId}</div>);

const mockUser = {
  id: 'user1',
  email: 'user1@example.com',
};

const mockRolesData = [
  {
    roleId: 'role1',
    role: {
      name: 'Role 1',
      description: 'Description for Role 1',
    },
    createdBy: 'user1',
    createdByUser: { name: 'User 1' },
    createdAt: '2022-01-01T00:00:00Z',
    scopeType: 'GLOBAL',
    scopeValue: null,
  },
  {
    roleId: 'role2',
    role: {
      name: 'Role 2',
      description: 'Description for Role 2',
    },
    createdBy: 'user2',
    createdByUser: { name: 'User 2' },
    createdAt: '2022-01-01T00:00:00Z',
    scopeType: 'PROJECT',
    scopeValue: 'Project 1',
  },
];

beforeAll(matchMedia);

describe('RolesTableUser component', () => {
  const reload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useFetchUsersRoles.mockReturnValue({ data: mockRolesData, error: null, loading: false });
    useRouter.mockReturnValue({ reload });
  });

  it('renders the component with roles data', () => {
    render(<RolesTableUser user={mockUser} />);

    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.getByText('Role 1')).toBeInTheDocument();
    expect(screen.getByText('Role 2')).toBeInTheDocument();
  });

  it('handles role revoke modal opening', async () => {
    render(<RolesTableUser user={mockUser} />);

    fireEvent.click(screen.getAllByText('Revoke role')[0]);

    expect(screen.getByTestId('revoke-role-modal')).toBeInTheDocument();
  });

  it('handles fetch roles error', () => {
    useFetchUsersRoles.mockReturnValue({ data: null, error: 'Error message', loading: false });

    render(<RolesTableUser user={mockUser} />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
