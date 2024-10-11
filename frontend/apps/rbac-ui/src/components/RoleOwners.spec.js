import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { matchMedia } from '@/specs/matchMedia.spec';
import RoleOwners from '@/components/RoleOwners';

jest.mock('next/router', () => ({
  reload: jest.fn(),
}));

beforeAll(matchMedia);

describe('RoleOwners component', () => {
  const mockRole = {
    id: '123',
    name: 'Test Role',
  };

  it('renders the title correctly', () => {
    render(<RoleOwners role={mockRole} />);
    expect(screen.getByText('Owners')).toBeInTheDocument();
  });

  it('renders error message when there is an error', () => {
    const errorMessage = 'Network response failed';

    render(<RoleOwners role={mockRole} error={errorMessage} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders data table when data is available', () => {
    const mockData = [
      {
        key: 0,
        ownerId: '1',
        ownerUser: {
          email: 'user1@example.com',
          name: 'User One',
        },
        roleId: '123',
        createdAt: new Date().toISOString(),
        createdBy: 'some-user',
        comments: 'test comment',
      },
      {
        key: 1,
        ownerId: '2',
        ownerUser: {
          email: 'user2@example.com',
          name: 'User Two',
        },
        roleId: '123',
        createdAt: new Date().toISOString(),
        createdBy: 'some-another-user',
        comments: 'test comment',
      },
    ];

    render(<RoleOwners role={mockRole} owners={mockData} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();

    // 3 = 1 for the header row and 2 for the data rows
    expect(screen.getAllByRole('row').length).toBe(3);
  });

  it('renders no owners message when no data is available', () => {
    render(<RoleOwners role={mockRole} owners={[]} />);
    expect(screen.getByText('No owners for this role')).toBeInTheDocument();
  });

  it('opens and closes AddOwnerToRoleModal when Add owner button is clicked', () => {
    render(<RoleOwners role={mockRole} />);

    const addButton = screen.getByRole('button', { name: /add owner/i });
    fireEvent.click(addButton);

    expect(screen.getByText(/add owner/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/remove/i)).not.toBeInTheDocument();
  });

  it('calls handleRemoveOwner when remove owner button is clicked', async () => {
    const mockData = [
      {
        key: 0,
        ownerId: '1',
        ownerUser: {
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
        },
        roleId: '123',
        createdAt: new Date().toISOString(),
        createdBy: 'some-user',
        comments: 'test comment',
      },
    ];

    render(<RoleOwners role={mockRole} owners={mockData} />);

    const removeButton = screen.getByRole('button', { name: /remove owner/i });
    fireEvent.click(removeButton);

    const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({}) };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    await waitFor(() => expect(document.querySelector('.ant-modal-mask')).toBeInTheDocument());

    const confirmButton = screen.getByRole('button', { name: 'Remove' });
    fireEvent.click(confirmButton);

    await waitFor(() => expect(screen.queryByText(/owner removed successfully/i)).toBeInTheDocument());
  });
});
