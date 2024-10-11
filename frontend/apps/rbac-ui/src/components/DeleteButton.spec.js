import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteButton from '@/components/DeleteButton';

const mockCategory = { id: '1', name: 'Test Category' };
const mockPermission = { id: '1', code: 'PERM1' };
const mockRole = { id: '1', name: 'Test Role' };

describe('DeleteButton component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the button and opens the modal on click', async () => {
    render(<DeleteButton onOk={() => {}} category={mockCategory}>Delete</DeleteButton>);

    const deleteButton = screen.getByTestId('delete-button-open-modal');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toBeVisible();
    });
  });

  it('displays the correct content for a category', async () => {
    render(<DeleteButton onOk={() => {}} category={mockCategory}>Delete</DeleteButton>);

    const deleteButton = screen.getByTestId('delete-button-open-modal');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('category-card')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this category?')).toBeInTheDocument();
      expect(screen.getByText('All the entities that are assigned to this category will lose it. This action is irreversible.')).toBeInTheDocument();
    });
  });

  it('displays the correct content for a permission', async () => {
    render(<DeleteButton onOk={() => {}} permission={mockPermission}>Delete</DeleteButton>);

    const deleteButton = screen.getByTestId('delete-button-open-modal');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('permission-card')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this permission?')).toBeInTheDocument();
      expect(screen.getByText('All the entities that are assigned to this permission will lose it. This action is irreversible.')).toBeInTheDocument();
    });
  });

  it('displays the correct content for a role', async () => {
    render(<DeleteButton onOk={() => {}} userRole={mockRole}>Delete</DeleteButton>);

    const deleteButton = screen.getByTestId('delete-button-open-modal');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('role-card')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this role?')).toBeInTheDocument();
      expect(screen.getByText('All the entities that are assigned to this role will lose it. This action is irreversible.')).toBeInTheDocument();
    });
  });

  it('enables the delete button when the correct keyword is entered', async () => {
    render(<DeleteButton onOk={() => {}} category={mockCategory}>Delete</DeleteButton>);

    const deleteButton = screen.getByTestId('delete-button-open-modal');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toBeVisible();
    });

    const input = screen.getByTestId('confirmation-input');
    fireEvent.change(input, { target: { value: 'Test Category' } });

    await waitFor(() => {
      expect(screen.getByTestId('confirm-button-delete')).not.toBeDisabled();
    });
  });

  it('calls onOk when the delete button is clicked', async () => {
    const mockOnOk = jest.fn();
    render(<DeleteButton onOk={mockOnOk} category={mockCategory}>Delete</DeleteButton>);

    const deleteButton = screen.getByTestId('delete-button-open-modal');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toBeVisible();
    });

    const input = screen.getByTestId('confirmation-input');
    fireEvent.change(input, { target: { value: 'Test Category' } });

    const confirmButton = screen.getByTestId('confirm-button-delete');
    fireEvent.click(confirmButton);

    expect(mockOnOk).toHaveBeenCalled();
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const mockOnCancel = jest.fn();
    render(<DeleteButton onOk={() => {}} onCancel={mockOnCancel} category={mockCategory}>Delete</DeleteButton>);

    const deleteButton = screen.getByTestId('delete-button-open-modal');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toBeVisible();
    });

    const cancelButton = screen.getByTestId('cancel-button-close-modal');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
