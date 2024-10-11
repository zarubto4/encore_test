import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddCategoryModal from '@/components/AddCategoryModal';
import { matchMedia } from '@/specs/matchMedia.spec';

// eslint-disable-next-line react/display-name
jest.mock('@/components/SelectPermissions', () => ({ onPermissionChange }) => (
  <div>
    <label htmlFor="permissions">Select Permissions</label>
    <input
      id="permissions"
      type="checkbox"
      onChange={(e) => onPermissionChange([e.target.value])}
      value="permission1"
    />
  </div>
));

// eslint-disable-next-line react/display-name
jest.mock('@/components/SelectRoles', () => ({ onRolesChange }) => (
  <div>
    <label htmlFor="roles">Select Roles</label>
    <input
      id="roles"
      type="checkbox"
      onChange={(e) => onRolesChange([e.target.value])}
      value="role1"
    />
  </div>
));

beforeAll(matchMedia);

describe('AddCategoryModal component', () => {
  const mockCategory = {
    id: '1',
    name: 'Test Category',
  };

  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal and handles opening and closing', () => {
    render(
      <AddCategoryModal
        isModalOpen={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        category={mockCategory}
        type="permission"
      />
    );

    // Check modal title
    expect(screen.getByText('Assign category to permissions')).toBeInTheDocument();

    // Close the modal
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('enables the submit button when permissions or roles are selected', () => {
    render(
      <AddCategoryModal
        isModalOpen={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        category={mockCategory}
        type="permission"
      />
    );

    // Initially, the submit button should be disabled
    const submitButton = screen.getByRole('button', { name: 'Assign category' });
    expect(submitButton).toBeDisabled();

    // Select a permission
    const permissionCheckbox = screen.getByLabelText('Select Permissions');
    fireEvent.click(permissionCheckbox);
    expect(submitButton).toBeEnabled();
  });

  it('handles form submission and calls the fetch API', async () => {
    const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({}) };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    render(
      <AddCategoryModal
        isModalOpen={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        category={mockCategory}
        type="permission"
      />
    );

    // Select a permission
    const permissionCheckbox = screen.getByLabelText('Select Permissions');
    fireEvent.click(permissionCheckbox);

    // Submit the form
    const submitButton = screen.getByText('Assign category');
    fireEvent.click(submitButton);

    // Wait for the fetch call and onSuccess
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      '/api/rbac/categories',
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: mockCategory.id,
          permissions: ['permission1'],
          roles: [],
        }),
      })
    ));
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled());
  });
});
