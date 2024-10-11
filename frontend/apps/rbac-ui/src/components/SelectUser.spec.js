import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectUser from '@/components/SelectUser';
import { isValidEmail } from '@/utils';

// Mock the isValidEmail utility function
jest.mock('@/utils', () => ({
  isValidEmail: jest.fn(),
}));

describe('SelectUser component', () => {
  const mockOnUsersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with placeholder', () => {
    render(<SelectUser onUsersChange={mockOnUsersChange} />);

    expect(screen.getByText('email@groupon.com')).toBeInTheDocument();
  });

  it('initializes with provided emails', () => {
    const initialEmails = ['test1@example.com', 'test2@example.com'];
    render(<SelectUser onUsersChange={mockOnUsersChange} initialEmails={initialEmails} />);

    initialEmails.forEach(email => {
      expect(screen.getByText(email)).toBeInTheDocument();
    });
  });

  it('handles valid email input', () => {
    isValidEmail.mockReturnValue(true);

    render(<SelectUser onUsersChange={mockOnUsersChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'valid@example.com' } });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });

    expect(isValidEmail).toHaveBeenCalledWith('valid@example.com');
    expect(mockOnUsersChange).toHaveBeenCalledWith(['valid@example.com']);
  });

  it('ignores invalid email input', () => {
    isValidEmail.mockReturnValue(false);

    render(<SelectUser onUsersChange={mockOnUsersChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });

    expect(isValidEmail).toHaveBeenCalledWith('invalid');
  });

  it('filters options and handles selection correctly', () => {
    isValidEmail.mockReturnValue(true);

    render(<SelectUser onUsersChange={mockOnUsersChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });

    expect(isValidEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockOnUsersChange).toHaveBeenCalledWith(['test@example.com']);
    expect(screen.getAllByText('test@example.com')[0]).toBeInTheDocument();

    // Add another valid email
    fireEvent.change(input, { target: { value: 'another@example.com' } });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });

    expect(isValidEmail).toHaveBeenCalledWith('another@example.com');
    expect(mockOnUsersChange).toHaveBeenCalledWith(['test@example.com', 'another@example.com']);
    expect(screen.getAllByText('another@example.com')[0]).toBeInTheDocument();
  });
});
