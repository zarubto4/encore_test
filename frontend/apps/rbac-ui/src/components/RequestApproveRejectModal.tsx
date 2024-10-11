import { useState, useMemo } from 'react';
import { Modal, Form, Button, message, Input } from 'antd';
import { RoleRequestStatus, ScopeType } from '@vpcs/rbac-client';
import { handleError } from '@/utils';
import RoleRequestCard from '@/components/RoleRequestCard';
import type { OwnerRoleRequest } from '@/types';

type RequestApproveRejectModalProps = {
  onSuccess: () => void;
  onCancel?: () => void;
  isModalOpen: boolean;
  roleRequest?: OwnerRoleRequest | null;
  status: RoleRequestStatus;
};

const { TextArea } = Input;

type FormFields = {
  scopeType: ScopeType;
  scopeValue: string;
  comment: string;
};

const LABELS = {
  APPROVED: {
    TITLE: 'Approve role request',
    COMMENT: 'Why are you approving this request',
    ACTION_BTN: 'Approve',
    REASON: 'Why are you approving this request?',
    SUCCESS_MSG: 'Role request approved successfully',
  },
  REJECTED: {
    TITLE: 'Reject this role request',
    COMMENT: 'Why are you rejecting this request',
    ACTION_BTN: 'Reject',
    REASON: 'Why are you rejecting this request?',
    SUCCESS_MSG: 'Role request rejected successfully',
  },
  CANCELLED: {
    TITLE: 'Cancel role request',
    COMMENT: 'Why are you cancelling this request',
    ACTION_BTN: 'Confirm',
    REASON: 'Why are you cancelling this request?',
    SUCCESS_MSG: 'Role request cancelled successfully',
  },
  PENDING: {
    TITLE: 'Cancel role request',
    COMMENT: 'Why are you cancelling this request',
    ACTION_BTN: 'Confirm',
    REASON: 'Why are you cancelling this request?',
    SUCCESS_MSG: 'Role request cancelled successfully',
  },
};

const RequestApproveRejectModal = ({
  onSuccess,
  onCancel,
  isModalOpen,
  roleRequest,
  status,
}: RequestApproveRejectModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const handleCancel = () => {
    onCancel?.();
  };

  const onFinish = async (values: FormFields) => {
    setLoading(true);
    if (!roleRequest) {
      return;
    }
    try {
      const response = await fetch(`/api/rbac/roles/requests/${roleRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: values.comment,
          status,
          region: roleRequest.region,
        }),
      });
      if (!response.ok) {
        const { message: responseMessage } = await response.json();
        throw new Error(responseMessage);
      }
      message.success(LABELS[status].SUCCESS_MSG);
      onSuccess();
    } catch (error) {
      console.error(error);
      message.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const initialValues = useMemo(
    () => ({
      comment: '',
    }),
    [],
  );

  const getActionBtn = () => {
    if (!status) {
      return null;
    }
    return (
      <Button
        key="submit"
        loading={loading}
        type="primary"
        danger={status === 'REJECTED'}
        onClick={() => form.submit()}
      >
        {LABELS[status].ACTION_BTN}
      </Button>
    );
  };

  return (
    <Modal
      title={status ? LABELS[status].TITLE : ''}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        getActionBtn(),
      ]}
    >
      {roleRequest && <RoleRequestCard role={roleRequest} />}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
        className="my-4"
        disabled={loading}
      >
        <Form.Item
          name="comment"
          label={status ? LABELS[status].REASON : ''}
          required
          tooltip="This is a required field"
          rules={[{ required: true, message: 'Please provide a reason' }]}
        >
          <TextArea rows={4} placeholder="Describe reason" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RequestApproveRejectModal;
