/* eslint-disable react/display-name */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RolesTableMy from '@/components/RolesTableMy';
import useFetchMyRoles from '@/hooks/useFetchMyRoles';
import { useAccount } from '@/contexts/AccountContext';
import { matchMedia } from '@/specs/matchMedia.spec';

jest.mock('@/hooks/useFetchMyRoles');
jest.mock('@/contexts/AccountContext');
jest.mock('@/components/User', () => ({ userId }) => <div data-testid="user">{userId}</div>);
jest.mock('@/components/RevokeRoleModal', () => (props) => <div data-testid="revoke-role-modal" {...props} />);

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

describe('RolesTableMy component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFetchMyRoles.mockReturnValue({ data: mockRolesData, error: null, loading: false });
    useAccount.mockReturnValue({ accountId: 'account1' });
  });

  it('renders the component with roles data', () => {
    render(<RolesTableMy />);

    expect(screen.getByText('My roles')).toBeInTheDocument();
    expect(screen.getByText('Role 1')).toBeInTheDocument();
    expect(screen.getByText('Role 2')).toBeInTheDocument();

  });

  it('handles role leave modal opening', async () => {
    render(<RolesTableMy />);

    fireEvent.click(screen.getAllByText('Leave role')[0]);

    expect(screen.getByTestId('revoke-role-modal')).toBeInTheDocument();
  });

  it('displays empty message when no roles are found', () => {
    useFetchMyRoles.mockReturnValue({ data: [], error: null, loading: false });

    render(<RolesTableMy />);

    expect(screen.getByText('You have no roles')).toBeInTheDocument();
  });
});
