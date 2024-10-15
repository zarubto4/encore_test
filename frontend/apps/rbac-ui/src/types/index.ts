import type { GetProp, TableProps } from 'antd';
import type { UserRegionType, UserType } from '@vpcs/users-client';
import type {
  RolesResponse,
  RolesOwnersResponse,
  PermissionsResponse,
  UserRolesCreateResponse,
  CategoriesCreateResponse,
  UserRolesCreateRequestResponse,
  RoleIdResponse,
  ScopeTypeCreateResponse,
  AuditResponse,
} from '@vpcs/rbac-client';

export type RoleWithUser = RoleIdResponse & { createdByUser: UserType };
export type RoleOwnerWithUser = RolesOwnersResponse & { ownerUser: UserType };
export type AssignResultType = {
  success: Array<{ email: string; userId: string; region: UserRegionType }>;
  failed: Array<{ email: string; region: UserRegionType; error: string }>;
}

export type PermissionWithUser = PermissionsResponse & { createdByUser: UserType };
export type UserRolesCreateResponseWithUser = UserRolesCreateResponse & {
  createdByUser: UserType;
  user: UserType;
  role: RolesResponse;
}

export type CategoriesWithUser = CategoriesCreateResponse & { createdByUser: UserType };
export type UserMyRole = UserRolesCreateRequestResponse & RolesResponse & { approvedBy: UserType };
export type UserRoleCombined = {
  myRoles: UserMyRole[];
  allRoles: RolesResponse[];
}

export type OwnerRoleRequest = UserRolesCreateRequestResponse &
  RolesResponse & { approvedBy: UserType } & { requestedBy: UserType };

export type ScopeTypeWithUser = ScopeTypeCreateResponse & { createdByUser: UserType };

export enum UserEnum {
  ADMIN = 'admin',
  USER = 'user',
  OWNER = 'owner',
}

export type Pagination = {
  pageSize?: number;
  total?: number;
  page: number;
}

export type TablePagination = Exclude<GetProp<TableProps, 'pagination'>, boolean>;
export type AuditLogWithUser = AuditResponse & { user: UserType } & { affectedObjectUser?: UserType } & { date: string };
export type UserData = {
  id: string;
  createdAt: string;
  brand: string | null;
  domain: string;
  email: string;
  emailVerifiedAt: string | null;
  firstName: string;
  isEmailVerified: boolean;
  isRegistered: boolean;
  lastName: string;
  locale: string;
  registeredAt: string;
  updatedAt: string;
}

export type HBUser = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}
