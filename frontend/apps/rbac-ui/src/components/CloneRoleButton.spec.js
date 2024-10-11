import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CloneRoleButton from '@/components/CloneRoleButton';
import { message } from 'antd';
import { matchMedia } from '@/specs/matchMedia.spec';

beforeAll(matchMedia);

jest.mock('@/components/RoleCard', () => ({ role }) => <div data-testid="role-card">{role.name}</div>);

jest.mock('@/utils', () => ({
  handleError: jest.fn().mockImplementation((error) => error.message),
}));

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockRole = {
  id: '1',
  name: 'Test Role',
  description: 'This is a test role',
  categories: [{ id: 'cat1', name: 'Category 1' }],
  permissions: [{ id: 'perm1', name: 'Permission 1' }],
};

describe('CloneRoleButton component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the button and opens the modal on click', async () => {
    render(<CloneRoleButton userRole={mockRole} />);

    const cloneButton = screen.getByTestId('clone-role-button-open-modal');
    fireEvent.click(cloneButton);

    await waitFor(() => {
      expect(screen.getByTestId('clone-role-modal')).toBeVisible();
    });
  });

  it('closes the modal when cancel button is clicked', async () => {
    render(<CloneRoleButton userRole={mockRole} />);

    const cloneButton = screen.getByTestId('clone-role-button-open-modal');
    fireEvent.click(cloneButton);

    await waitFor(() => {
      expect(screen.getByTestId('clone-role-modal')).toBeVisible();
    });

    const cancelButton = screen.getByTestId('cancel-button-close-modal');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByTestId('clone-role-modal')).not.toBeVisible();
    });
  });

  it('handles successful role cloning', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: '2' }),
      })
    );

    render(<CloneRoleButton userRole={mockRole} />);

    const cloneButton = screen.getByTestId('clone-role-button-open-modal');
    fireEvent.click(cloneButton);

    await waitFor(() => {
      expect(screen.getByTestId('clone-role-modal')).toBeVisible();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-button-clone-role'));
    });

    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith('Role cloned successfully');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/rbac/roles',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categories: ['cat1'],
            permissions: ['perm1'],
            name: 'Test Role (copy)',
            description: 'This is a test role',
          }),
        })
      );
    });
  });

  it('handles role cloning failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Error message' }),
      })
    );

    render(<CloneRoleButton userRole={mockRole} />);

    const cloneButton = screen.getByTestId('clone-role-button-open-modal');
    fireEvent.click(cloneButton);

    await waitFor(() => {
      expect(screen.getByTestId('clone-role-modal')).toBeVisible();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('submit-button-clone-role'));
    });

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Error message');
    });
  });
});
