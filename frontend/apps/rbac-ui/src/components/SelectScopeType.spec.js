import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectScopeType from '@/components/SelectScopeType';
import useFetchScopeTypes from '@/hooks/useFetchScopeTypes';

// Mock the useFetchScopeTypes hook
jest.mock('@/hooks/useFetchScopeTypes');

const mockUseFetchScopeTypes = useFetchScopeTypes;

describe('SelectScopeType component', () => {
  const mockOnChange = jest.fn();

  const mockData = [
    { scopeType: 'GLOBAL' },
    { scopeType: 'LOCAL' },
    { scopeType: 'MERCHANT' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with loading state', () => {
    mockUseFetchScopeTypes.mockReturnValue({ data: null, loading: true });

    render(<SelectScopeType onChange={mockOnChange} />);

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders the component with data', () => {
    mockUseFetchScopeTypes.mockReturnValue({ data: mockData, loading: false });

    render(<SelectScopeType onChange={mockOnChange} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'GLOBAL' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'LOCAL' })).toBeInTheDocument();
  });

  it('handles change event correctly', () => {
    mockUseFetchScopeTypes.mockReturnValue({ data: mockData, loading: false });

    render(<SelectScopeType onChange={mockOnChange} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByTitle('LOCAL'));

    expect(mockOnChange).toHaveBeenCalledWith('LOCAL');
  });

  it('renders with a default selected scope type', () => {
    mockUseFetchScopeTypes.mockReturnValue({ data: mockData, loading: false });

    const { container } = render(<SelectScopeType onChange={mockOnChange} selectedScopeType="MERCHANT" />);
    const selectElement = container.querySelector('.ant-select-selection-item');
    expect(selectElement).toHaveTextContent('MERCHANT');
  });

});
