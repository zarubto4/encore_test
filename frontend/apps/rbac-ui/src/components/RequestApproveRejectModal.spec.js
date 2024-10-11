/* eslint-disable react/display-name */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RequestApproveRejectModal from '@/components/RequestApproveRejectModal';
import { RoleRequestStatus } from '@vpcs/rbac-client';
import { handleError } from '@/utils';
import { matchMedia } from '@/specs/matchMedia.spec';

beforeAll(matchMedia);

const mockRoleRequest = {
  id: '1',
  name: 'Test Role Request',
};

jest.mock('@/utils', () => ({
  handleError: jest.fn().mockImplementation((error) => error.message),
}));

describe('RequestApproveRejectModal component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with correct title and button based on status', () => {
    render(
      <RequestApproveRejectModal
        isModalOpen={true}
        status={RoleRequestStatus.APPROVED}
        roleRequest={mockRoleRequest}
        onSuccess={jest.fn()}
      />
    );
  
    expect(screen.getByText('Approve role request')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
  });

  it('renders the RoleRequestCard when roleRequest is provided', () => {
    render(
      <RequestApproveRejectModal
        isModalOpen={true}
        status={RoleRequestStatus.APPROVED}
        roleRequest={mockRoleRequest}
        onSuccess={jest.fn()}
      />
    );

    expect(screen.getByTestId('role-request-card')).toBeInTheDocument();
    expect(screen.getByTestId('role-request-card')).toHaveTextContent(mockRoleRequest.name);
  });

  it('handles form submission successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    const mockOnSuccess = jest.fn();
    render(
      <RequestApproveRejectModal
        isModalOpen={true}
        status={RoleRequestStatus.APPROVED}
        roleRequest={mockRoleRequest}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Describe reason'), { target: { value: 'Reason for approval' } });
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/rbac/roles/requests/${mockRoleRequest.id}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            comment: 'Reason for approval',
            status: RoleRequestStatus.APPROVED,
          }),
        })
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles form submission failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Error occurred' }),
      })
    );

    render(
      <RequestApproveRejectModal
        isModalOpen={true}
        status={RoleRequestStatus.APPROVED}
        roleRequest={mockRoleRequest}
        onSuccess={jest.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Describe reason'), { target: { value: 'Reason for approval' } });
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => {
      expect(handleError).toHaveBeenCalled();
    });
  });

  it('calls onCancel when the cancel button is clicked', () => {
    const mockOnCancel = jest.fn();
    render(
      <RequestApproveRejectModal
        isModalOpen={true}
        status={RoleRequestStatus.APPROVED}
        roleRequest={mockRoleRequest}
        onSuccess={jest.fn()}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
