/**
 * {
 *   scopeType: "DCT",
 *   scopeValue: "GLOBAL" | "EMEA" | "NA" | "MY_SPECIAL" | "afb71d88-d645-42aa-9b5d-4d1da1670a0f"
 *   permission: "CAN_READ" | "CAN_REMOVE" | "CAN_UPDATE"
 * }
 */
export interface IRBACPermission {
  scopeType: string; // Application name like DCT, RBAC, MC etc.
  scopeValue: string; // Resource ID (like Merchant ID, or Object ID) or Resource Type
  permission: string; // Permission Key
}

export class RBACPermissions implements IRBACPermission {
  permission: string;
  scopeType: string;
  scopeValue: string;
  constructor(scopeType: string, scopeValue: string, permission: string) {
    this.scopeType = scopeType;
    this.scopeValue = scopeValue;
    this.permission = permission;
  }
}
