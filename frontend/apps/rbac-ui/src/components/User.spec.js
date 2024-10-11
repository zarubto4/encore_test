import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import User from '@/components/User';
import useFetchUser from '@/hooks/useFetchUser';

// Mock the useFetchUser hook
jest.mock('@/hooks/useFetchUser');

const mockUseFetchUser = useFetchUser;

describe('User component', () => {
  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  };

  const mockSystemUser = {
    id: '00000000-0000-0000-0000-000000000000',
    firstName: 'System',
    lastName: 'User',
    email: 'rbac@groupon.com',
  };

  it('renders loading state', () => {
    mockUseFetchUser.mockReturnValue({ data: null, loading: true, error: null });

    render(<User userId="1" />);

    expect(screen.getByTestId('loading-user')).toBeInTheDocument();
  });

  it('renders unresolved user when there is an error', () => {
    mockUseFetchUser.mockReturnValue({ data: null, loading: false, error: true });

    render(<User userId="1" />);

    expect(screen.getByText('Unresolved user')).toBeInTheDocument();
  });

  it('renders unresolved user when data is not found', () => {
    mockUseFetchUser.mockReturnValue({ data: null, loading: false, error: null });

    render(<User userId="1" />);

    expect(screen.getByText('Unresolved user')).toBeInTheDocument();
  });

  it('renders user name', () => {
    mockUseFetchUser.mockReturnValue({ data: mockUser, loading: false, error: null });

    render(<User userId="1" />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders user name with prop show', () => {
    mockUseFetchUser.mockReturnValue({ data: mockUser, loading: false, error: null });

    render(<User userId="1" show="name" />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders user email', () => {
    mockUseFetchUser.mockReturnValue({ data: mockUser, loading: false, error: null });

    render(<User userId="1" show="email" />);

    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('renders user name and email on two lines', () => {
    mockUseFetchUser.mockReturnValue({ data: mockUser, loading: false, error: null });

    render(<User userId="1" show="both" twolines />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('renders user name and email on one line', () => {
    mockUseFetchUser.mockReturnValue({ data: mockUser, loading: false, error: null });

    render(<User userId="1" show="both" twolines={false} />);

    expect(screen.getByText(/John Doe john.doe@example.com/)).toBeInTheDocument();
  });

  it('handles system user ID', () => {
    mockUseFetchUser.mockReturnValue({ data: mockSystemUser, loading: false, error: null });

    render(<User userId="00000000-0000-0000-0000-000000000000" />);

    expect(screen.getByText('System User')).toBeInTheDocument();
  });

  it('handles unspecified show property with both name and email shown', () => {
    mockUseFetchUser.mockReturnValue({ data: mockUser, loading: false, error: null });

    render(<User userId="1" showName showEmail />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });
});
