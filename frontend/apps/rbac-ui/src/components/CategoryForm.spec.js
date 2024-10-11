import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryForm from '@/components/CategoryForm';
import { message } from 'antd';
import { matchMedia } from '@/specs/matchMedia.spec';

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    error: jest.fn(),
  },
}));

beforeAll(matchMedia);

// eslint-disable-next-line react/display-name
jest.mock('@/components/DeleteButton', () => ({ category, onOk }) => (
  <button data-testid="delete-button" onClick={onOk}>Delete {category.name}</button>
));

jest.mock('@/utils', () => ({
  handleError: jest.fn().mockImplementation((error) => error.message),
}));

const mockInitialValues = {
  id: '1',
  name: 'Category 1',
  description: 'This is the description for Category 1',
  createdBy: 'user1',
};

describe('CategoryForm component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with initial values', () => {
    render(<CategoryForm initialValues={mockInitialValues} />);

    expect(screen.getByDisplayValue('Category 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('This is the description for Category 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  it('renders the form for creating a new category', () => {
    render(<CategoryForm />);

    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
  });

  it('handles form submission for creating a new category', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const mockOnSuccessfulSubmit = jest.fn();
    const mockOnSubmit = jest.fn();

    render(<CategoryForm onSubmit={mockOnSubmit} onSuccessfulSubmit={mockOnSuccessfulSubmit} />);

    const nameInput = screen.getByLabelText('Category name');
    const descriptionInput = screen.getByLabelText('Category description');
    const createButton = screen.getByRole('button', { name: 'Create' });

    fireEvent.change(nameInput, { target: { value: 'New Category' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Category Description' } });

    await act(async () => {
      fireEvent.click(createButton);
    });

    await waitFor(() => expect(mockOnSuccessfulSubmit).toHaveBeenCalled());

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/rbac/categories',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Category',
          description: 'New Category Description',
        }),
      })
    );
  });

  it('handles form submission for updating a category', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const mockOnSuccessfulSubmit = jest.fn();
    const mockOnSubmit = jest.fn();

    render(
      <CategoryForm
        initialValues={mockInitialValues}
        onSubmit={mockOnSubmit}
        onSuccessfulSubmit={mockOnSuccessfulSubmit}
      />
    );

    const descriptionInput = screen.getByLabelText('Category description');
    const saveButton = screen.getByRole('button', { name: 'Save' });

    fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => expect(mockOnSuccessfulSubmit).toHaveBeenCalled());

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/rbac/categories/${mockInitialValues.id}`,
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'Updated Description',
        }),
      })
    );
  });

  it('handles category deletion', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const mockOnSuccessfulDelete = jest.fn();
    const mockOnSubmit = jest.fn();

    render(
      <CategoryForm
        initialValues={mockInitialValues}
        onSubmit={mockOnSubmit}
        onSuccessfulDelete={mockOnSuccessfulDelete}
      />
    );

    const deleteButton = screen.getByTestId('delete-button');

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => expect(mockOnSuccessfulDelete).toHaveBeenCalled());

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/rbac/categories/${mockInitialValues.id}`,
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('shows error message on submission failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Error message' }),
      })
    );

    const mockOnSubmit = jest.fn();

    render(<CategoryForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('Category name');
    const descriptionInput = screen.getByLabelText('Category description');
    const createButton = screen.getByRole('button', { name: 'Create' });

    fireEvent.change(nameInput, { target: { value: 'New Category' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Category Description' } });

    await act(async () => {
      fireEvent.click(createButton);
    });

    await waitFor(() => expect(message.error).toHaveBeenCalledWith('Error message'));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/rbac/categories',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Category',
          description: 'New Category Description',
        }),
      })
    );
  });
});
