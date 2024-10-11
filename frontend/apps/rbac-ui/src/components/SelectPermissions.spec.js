import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectPermissions from '@/components/SelectPermissions';
import useFetchPermissions from '@/hooks/useFetchPermissions';

// Mock the useFetchPermissions hook
jest.mock('@/hooks/useFetchPermissions');

const mockPermissions = [
  { id: '1', code: 'PERMISSION_1', key: 'perm1' },
  { id: '2', code: 'PERMISSION_2', key: 'perm2' },
];

describe('SelectPermissions component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFetchPermissions.mockReturnValue({ data: mockPermissions, loading: false });
  });

  it('renders the component with options', async () => {
    render(<SelectPermissions onPermissionChange={jest.fn()} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByText('PERMISSION_1')).toBeInTheDocument();
      expect(screen.getByText('PERMISSION_2')).toBeInTheDocument();
    });
  });

  it('handles permission selection', async () => {
    const mockOnPermissionChange = jest.fn();
    render(<SelectPermissions initialPermissions={[]} onPermissionChange={mockOnPermissionChange} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => {
      fireEvent.click(screen.getByText('PERMISSION_1'));
    });

    expect(mockOnPermissionChange).toHaveBeenCalledWith('1');
  });

  it('renders with initial permissions', () => {
    render(<SelectPermissions onPermissionChange={jest.fn()} initialPermissions={['1']} />);

    expect(screen.getByText('PERMISSION_1')).toBeInTheDocument();
  });

  it('handles search input', async () => {
    render(<SelectPermissions onPermissionChange={jest.fn()} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'PERMISSION_1' } });

    await waitFor(() => {
      expect(useFetchPermissions).toHaveBeenCalledWith({ search: 'PERMISSION_1', noPagination: true, deleted: false });
    });
  });
});
