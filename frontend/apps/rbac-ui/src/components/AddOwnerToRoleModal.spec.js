import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddOwnerToRoleModal from '@/components/AddOwnerToRoleModal';
import { matchMedia } from '@/specs/matchMedia.spec';

// eslint-disable-next-line react/display-name
jest.mock('@/components/SelectUser', () => ({ onUsersChange }) => (
  <div>
    <label htmlFor="users">Select Users</label>
    <input
      id="users"
      type="checkbox"
      onChange={(e) => onUsersChange([e.target.value])}
      value="user1@example.com"
    />
  </div>
));

beforeAll(matchMedia);

describe('AddOwnerToRoleModal component', () => {
  const mockRole = {
    id: '1',
    name: 'Test Role',
  };

  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal and handles opening and closing', () => {
    render(
      <AddOwnerToRoleModal
        isModalOpen={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        role={mockRole}
      />
    );

    // Check modal title
    expect(screen.getByText('Assign owner to role')).toBeInTheDocument();

    // Close the modal
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('enables the submit button when users are selected', () => {
    render(
      <AddOwnerToRoleModal
        isModalOpen={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        role={mockRole}
      />
    );

    // Initially, the submit button should be disabled
    const submitButton = screen.getByRole('button', { name: 'Assign owner' });
    expect(submitButton).toBeDisabled();

    // Select a user
    const userCheckbox = screen.getByLabelText('Select Users');
    fireEvent.click(userCheckbox);
    expect(submitButton).toBeEnabled();
  });

  it('handles form submission and calls the fetch API', async () => {
    const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({ success: [{ email: 'user1@example.com' }], failed: [] }) };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    render(
      <AddOwnerToRoleModal
        isModalOpen={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        role={mockRole}
      />
    );

    // Select a user
    const userCheckbox = screen.getByLabelText('Select Users');
    fireEvent.click(userCheckbox);

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Assign owner' });
    fireEvent.click(submitButton);

    // Wait for the fetch call and onSuccess
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      `/api/rbac/roles/${mockRole.id}/owners`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: ['user1@example.com'],
          regions: ['NA'],
        }),
      })
    ));
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalledWith(true));
  });
});
