/* eslint-disable react/display-name */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoleRequestCard from '@/components/RoleRequestCard';
import { matchMedia } from '@/specs/matchMedia.spec';

jest.mock('@/components/User', () => ({ userId, user, twolines, show }) => (
  <div data-testid="user-info">
    {user.name} ({user.email})
  </div>
));

jest.mock('@/components/typography/RoleTitle', () => ({ children }) => (
  <h3 data-testid="role-title">{children}</h3>
));

beforeAll(matchMedia);

const mockRoleRequest = {
  id: '1',
  requesterId: 'user1',
  requestedBy: {
    id: 'user1',
    name: 'Requesting User',
    email: 'requesting@example.com',
  },
  name: 'Test Role',
  description: 'This is a test role',
  requesterComment: 'This is the reason for the request',
};

describe('RoleRequestCard component', () => {
  it('renders the role request card with correct information', () => {
    render(<RoleRequestCard role={mockRoleRequest} />);

    expect(screen.getByText('Request')).toBeInTheDocument();

    expect(screen.getByText('From:')).toBeInTheDocument();
    expect(screen.getByTestId('user-info')).toHaveTextContent('Requesting User (requesting@example.com)');

    expect(screen.getByText('For role:')).toBeInTheDocument();
    expect(screen.getByTestId('role-title')).toHaveTextContent('Test Role');
    expect(screen.getByText('This is a test role')).toBeInTheDocument();

    expect(screen.getByText('Reason:')).toBeInTheDocument();
    expect(screen.getByText('This is the reason for the request')).toBeInTheDocument();
  });
});
