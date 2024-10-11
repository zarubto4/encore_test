import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectRoles from '@/components/SelectRoles';
import useFetchRoles from '@/hooks/useFetchRoles';

// Mock the useFetchRoles hook
jest.mock('@/hooks/useFetchRoles');

const mockRoles = [
  { id: '1', name: 'Role 1' },
  { id: '2', name: 'Role 2' },
];

describe('SelectRoles component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFetchRoles.mockReturnValue({ data: mockRoles, loading: false });
  });

  it('renders the component with options', async () => {
    render(<SelectRoles onRolesChange={jest.fn()} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByText('Role 1')).toBeInTheDocument();
      expect(screen.getByText('Role 2')).toBeInTheDocument();
    });
  });

  it('handles role selection', async () => {
    const mockOnRolesChange = jest.fn();
    render(<SelectRoles initialRoles={[]} onRolesChange={mockOnRolesChange} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => {
      fireEvent.click(screen.getByText('Role 1'));
    });

    expect(mockOnRolesChange).toHaveBeenCalledWith('1');
  });

  it('disables the select when loading', () => {
    useFetchRoles.mockReturnValue({ data: [], loading: true });

    render(<SelectRoles onRolesChange={jest.fn()} />);

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders with initial roles', () => {
    render(<SelectRoles onRolesChange={jest.fn()} selected={['1']} />);

    expect(screen.getByText('Role 1')).toBeInTheDocument();
  });

  it('applies hideRolesIds filter', async () => {
    render(<SelectRoles onRolesChange={jest.fn()} hideRolesIds={['1']} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.queryByText('Role 1')).not.toBeInTheDocument();
      expect(screen.getByText('Role 2')).toBeInTheDocument();
    });
  });

  it('applies showOnlyRolesIds filter', async () => {
    render(<SelectRoles onRolesChange={jest.fn()} showOnlyRolesIds={['2']} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.queryByText('Role 1')).not.toBeInTheDocument();
      expect(screen.getByText('Role 2')).toBeInTheDocument();
    });
  });
});
