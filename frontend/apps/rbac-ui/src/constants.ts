import { USER_REGION, UserRegionType } from '@vpcs/users-client';

export const RBAC_TOKEN_COOKIE = 'rbac-auth';
export const LOGGER_APP_NAME = 'mx-rbac-ui-service';
export const RBAC_USER_ID_HEADER = 'x-grpn-user-id';
export const RBAC_USER_ID_NA = 'x-grpn-user-id-na';
export const RBAC_USER_ID_EMEA = 'x-grpn-user-id-emea';
export const RBAC_USER_REGION_HEADER = 'x-grpn-user-region';
export const MARKER_PROJECT_ID = '66b63235951ea58b8ad46ad9';
export const HB_USER_FIRST_NAME = 'x-grpn-firstname';
export const HB_USER_LAST_NAME = 'x-grpn-lastname';
export const HB_USER_EMAIL = 'x-grpn-email';
export const USERS_DOMAINS = { NA: ['internal', 'groupon.com'], EMEA: ['internal'] };
export const USER_REGION_SELECT = Object.keys(USER_REGION) as UserRegionType[];

export const ROLE_REQ_STATUS_COLOR = {
  PENDING: 'orange',
  APPROVED: 'green',
  REJECTED: 'red',
  CANCELLED: 'blue',
};

export const ROLE_REQ_STATUS_DISPLAY = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export const LOG_TYPE_OPTIONS = {
  USERS_ROLES_ASSIGNMENTS: 'users_roles_assignments',
  ROLES_PERMISSIONS_ASSIGNMENTS: 'roles_permissions_assignments',
  ROLES_HISTORY: 'roles',
  PERMISSIONS_HISTORY: 'permissions',
};
