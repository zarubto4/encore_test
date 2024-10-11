import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectRequestStatus from '@/components/SelectRequestStatus';
import { RoleRequestStatus } from '@vpcs/rbac-client';
import useIsLargeScreen from '@/hooks/useIsLargeScreen';

jest.mock('@/hooks/useIsLargeScreen');

describe('SelectRequestStatus component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Radio group on large screens', () => {
    useIsLargeScreen.mockReturnValue(true);

    render(<SelectRequestStatus onStatusChanged={jest.fn()} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('renders the Select dropdown on small screens', () => {
    useIsLargeScreen.mockReturnValue(false);

    render(<SelectRequestStatus onStatusChanged={jest.fn()} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles status change correctly on large screens', () => {
    useIsLargeScreen.mockReturnValue(true);
    const mockOnStatusChanged = jest.fn();

    render(<SelectRequestStatus onStatusChanged={mockOnStatusChanged} />);

    fireEvent.click(screen.getByLabelText('Approved'));

    expect(mockOnStatusChanged).toHaveBeenCalledWith(RoleRequestStatus.APPROVED);
  });

  it('handles status change correctly on small screens', () => {
    useIsLargeScreen.mockReturnValue(false);
    const mockOnStatusChanged = jest.fn();

    render(<SelectRequestStatus onStatusChanged={mockOnStatusChanged} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Approved'));

    expect(mockOnStatusChanged).toHaveBeenCalledWith(RoleRequestStatus.APPROVED);
  });

  it('renders with initial selected status', () => {
    useIsLargeScreen.mockReturnValue(true);

    render(<SelectRequestStatus onStatusChanged={jest.fn()} selectedStatus={RoleRequestStatus.APPROVED} />);

    expect(screen.getByLabelText('Approved')).toBeChecked();
  });
});
