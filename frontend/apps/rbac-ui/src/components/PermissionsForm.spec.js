/* eslint-disable react/display-name */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PermissionsForm from '@/components/PermissionsForm';
import { matchMedia } from '@/specs/matchMedia.spec';

beforeAll(matchMedia);

jest.mock('@/components/SelectCategories', () => (props) => (
  <div data-testid="select-categories" {...props} />
));
jest.mock('@/components/DeleteButton', () => (props) => (
  <button data-testid="delete-button" onClick={props.onOk} {...props}>Delete</button>
));
jest.mock('@/utils', () => ({
  handleError: jest.fn(),
}));
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockPermission = {
  id: '1',
  code: 'USER:PROFILE:CREATE',
  description: 'Create user profile',
  categories: [{ id: 'cat1', name: 'Category 1' }],
};

describe('PermissionsForm component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with a permission', () => {
    render(<PermissionsForm permission={mockPermission} />);

    expect(screen.getByText(mockPermission.code)).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  it('renders correctly without a permission', () => {
    render(<PermissionsForm />);

    expect(screen.getByText('New Permission')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const onSuccessfulSubmit = jest.fn();
    render(<PermissionsForm permission={mockPermission} onSuccessfulSubmit={onSuccessfulSubmit} />);

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onSuccessfulSubmit).toHaveBeenCalled();
    });
  });


  it('deletes the permission successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    render(<PermissionsForm permission={mockPermission} />);

    fireEvent.click(screen.getByTestId('delete-button'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/rbac/permissions/${mockPermission.id}`, expect.objectContaining({
        method: 'DELETE',
      }));
    });
  });

  it('handles input changes correctly', () => {
    render(<PermissionsForm permission={mockPermission} />);

    const descriptionInput = screen.getByLabelText('Permission Description');
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

    expect(descriptionInput).toHaveValue('Updated description');
  });
});
