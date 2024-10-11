import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Username from '@/components/LoggedUser';

// eslint-disable-next-line react/display-name
jest.mock('@/components/User', () => ({ userId }) => <div data-testid="user-component">{userId}</div>);

describe('Username component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the User component when userId is provided', () => {
    const userId = '12345';
    render(<Username userId={userId} />);

    expect(screen.getByTestId('user-component')).toBeInTheDocument();
    expect(screen.getByTestId('user-component')).toHaveTextContent(userId);
  });

  it('does not render the User component when userId is not provided', () => {
    render(<Username />);

    expect(screen.queryByTestId('user-component')).not.toBeInTheDocument();
  });

  it('renders the logout option when NEXT_PUBLIC_ENV is local', () => {
    process.env.NEXT_PUBLIC_ENV = 'local';
    render(<Username userId="12345" />);

    expect(screen.queryByRole('img', { class: /anticon anticon-down/i })).toBeInTheDocument();
  });

  it('does not render the logout option when NEXT_PUBLIC_ENV is not local', () => {
    process.env.NEXT_PUBLIC_ENV = 'production';
    render(<Username userId="12345" />);

    expect(screen.queryByRole('img', { class: /anticon anticon-down/i })).not.toBeInTheDocument();
  });
});
