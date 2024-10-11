/* eslint-disable react/display-name */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoleRequestModal from '@/components/RoleRequestModal';
import { matchMedia } from '@/specs/matchMedia.spec';
import { message } from 'antd';

jest.mock('@/components/SelectRoles', () => ({ onRolesChange }) => (
  <select data-testid="select-roles" onChange={(e) => onRolesChange([e.target.value])}>
    <option value="role1">Role 1</option>
    <option value="role2">Role 2</option>
  </select>
));
jest.mock('@/components/SelectScopeType', () => ({ onChange }) => (
  <select data-testid="select-scope-type" onChange={(e) => onChange(e.target.value)}>
    <option value="GLOBAL">Global</option>
    <option value="SPECIFIC">Specific</option>
  </select>
));

jest.mock('@/utils', () => ({
  handleError: jest.fn().mockImplementation((error) => error.message),
}));

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

beforeAll(matchMedia);

const mockRole = {
  id: '1',
  name: 'Test Role',
  description: 'This is a test role',
};

const mockOnSuccess = jest.fn();
const mockOnCancel = jest.fn();

describe('RoleRequestModal component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with correct title and elements', () => {
    render(
      <RoleRequestModal
        isModalOpen={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        role={mockRole}
      />
    );

    expect(screen.getByText('Request Role')).toBeInTheDocument();
    expect(screen.getByTestId('role-card')).toHaveTextContent('Test Role');
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send request/i })).toBeInTheDocument();
  });

  it('handles form submission success', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    render(
      <RoleRequestModal
        isModalOpen={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        role={mockRole}
      />
    );

    fireEvent.change(screen.getByTestId('select-scope-type'), { target: { value: 'GLOBAL' } });
    fireEvent.change(screen.getByPlaceholderText('Describe reason'), { target: { value: 'Need this role' } });

    fireEvent.click(screen.getByRole('button', { name: /send request/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/rbac/roles/requests', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: '1',
          scopeType: 'GLOBAL',
          comment: 'Need this role',
          regions: ["NA"],
        }),
      }));
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith('Role requested successfully');
    });
  });

  it('handles form submission error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Error message' }),
      })
    );

    render(
      <RoleRequestModal
        isModalOpen={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        role={mockRole}
      />
    );

    fireEvent.change(screen.getByTestId('select-scope-type'), { target: { value: 'GLOBAL' } });
    fireEvent.change(screen.getByPlaceholderText('Describe reason'), { target: { value: 'Need this role' } });

    fireEvent.click(screen.getByRole('button', { name: /send request/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(message.error).toHaveBeenCalledWith('Error message');
    });
  });

  it('closes the modal when cancel button is clicked', () => {
    render(
      <RoleRequestModal
        isModalOpen={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        role={mockRole}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
