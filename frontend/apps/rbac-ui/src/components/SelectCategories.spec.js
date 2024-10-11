import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectCategories from '@/components/SelectCategories';
import useFetchCategories from '@/hooks/useFetchCategories';

jest.mock('@/hooks/useFetchCategories');

const mockCategories = [
  { id: '1', name: 'Category 1', key: 'cat1' },
  { id: '2', name: 'Category 2', key: 'cat2' },
];

describe('SelectCategories component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFetchCategories.mockReturnValue({ data: mockCategories, loading: false });
  });

  it('renders the component with options', async () => {
    render(<SelectCategories onCategoriesChange={jest.fn()} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Category 2')).toBeInTheDocument();
    });
  });

  it('handles category selection', async () => {
    const mockOnCategoriesChange = jest.fn();
    render(<SelectCategories initialCategories={[]} onCategoriesChange={mockOnCategoriesChange} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('Category 1'));
    });

    expect(mockOnCategoriesChange).toHaveBeenCalledWith(['1']);
  });

  it('disables the select when loading', () => {
    useFetchCategories.mockReturnValue({ data: [], loading: true });

    render(<SelectCategories onCategoriesChange={jest.fn()} />);
    
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders with initial categories', () => {
    render(<SelectCategories onCategoriesChange={jest.fn()} initialCategories={['1']} />);

    expect(screen.getByText('Category 1')).toBeInTheDocument();
  });

  it('handles category deselection', async () => {
    const mockOnCategoriesChange = jest.fn();
    render(<SelectCategories onCategoriesChange={mockOnCategoriesChange} initialCategories={['1']} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Category 1')[1]);
    });

    expect(mockOnCategoriesChange).toHaveBeenCalledWith([]);
  });
});
