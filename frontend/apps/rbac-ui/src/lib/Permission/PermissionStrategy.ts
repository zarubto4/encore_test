export interface PermissionStrategy {
  hasPermission(permission: string): boolean;
  getPermissions(): string[];
}

export class UserPermissionStrategy implements PermissionStrategy {
  private permissions: Set<string>;

  constructor(permissions: string[]) {
    this.permissions = new Set(permissions);
  }

  hasPermission(permission: string): boolean {
    return this.permissions.has(permission);
  }
  getPermissions() {
    return Array.from(this.permissions);
  }
}
