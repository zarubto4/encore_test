import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScopeTypeForm from '@/components/ScopeTypeForm';
import { message } from 'antd';
import { matchMedia } from '@/specs/matchMedia.spec';

beforeAll(matchMedia);

// Mock the message and handleError functions
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('@/utils', () => ({
  handleError: jest.fn((error) => error.message),
}));

const mockInitialValues = {
  scopeType: 'test-scope',
  description: 'Test description',
};

describe('ScopeTypeForm component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with initial values for edit', () => {
    render(<ScopeTypeForm initialValues={mockInitialValues} type="edit" />);

    expect(screen.getByDisplayValue('test-scope')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
  });

  it('renders the form without initial values for new', () => {
    render(<ScopeTypeForm type="new" />);

    expect(screen.getByLabelText('Scope type')).toHaveValue('');
    expect(screen.getByLabelText('Scope type description')).toHaveValue('');
  });

  it('handles form submission success for new scope type', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const mockOnSuccessfulSubmit = jest.fn();
    render(<ScopeTypeForm type="new" onSuccessfulSubmit={mockOnSuccessfulSubmit} />);

    fireEvent.change(screen.getByLabelText('Scope type'), { target: { value: 'new-scope' } });
    fireEvent.change(screen.getByLabelText('Scope type description'), { target: { value: 'New description' } });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/rbac/scope_types',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scopeType: 'new-scope',
            description: 'New description',
          }),
        })
      );
    });
    expect(mockOnSuccessfulSubmit).toHaveBeenCalled();
  });

  it('handles form submission success for editing scope type', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const mockOnSuccessfulSubmit = jest.fn();
    render(<ScopeTypeForm initialValues={mockInitialValues} type="edit" onSuccessfulSubmit={mockOnSuccessfulSubmit} />);

    fireEvent.change(screen.getByLabelText('Scope type description'), { target: { value: 'Updated description' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/rbac/scope_types/test-scope',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: 'Updated description' }),
        })
      );      
    });
    expect(mockOnSuccessfulSubmit).toHaveBeenCalled();
  });

  it('handles form submission error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Error message' }),
      })
    );

    render(<ScopeTypeForm type="new" />);

    fireEvent.change(screen.getByLabelText('Scope type'), { target: { value: 'new-scope' } });
    fireEvent.change(screen.getByLabelText('Scope type description'), { target: { value: 'New description' } });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Error message');
    });
  });
});
