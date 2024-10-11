import { RbacApiClient } from 'libs/rbac-client/src';
import { PermissionStrategy, UserPermissionStrategy } from '@/lib/Permission';

const CACHE_EXPIRATION = 1 * 60 * 1000; // 1 minutes
const cache: {
  [userId: string]: { permissions: string[]; timestamp: number };
} = {};

const fetchPermissionsFromApi = async (userId: string): Promise<string[]> => {
  console.info(`Fetching permissions from API for userId:#${userId}`);

  try {
    const rbac = new RbacApiClient({ userId });
    const { data } = await rbac.api.v2.usersPermissionsDetail(userId);

    const permissions = new Set<string>();
    data.forEach((role) => {
      role.permissions?.forEach((permission) => {
        permissions.add(permission);
      });
    });

    return Array.from(permissions);
  } catch (err) {
    return [];
  }
};

export class PermissionFactory {
  static async createPermissionStrategy(userId: string): Promise<PermissionStrategy> {
    const now = Date.now();
    const cached = cache[userId];

    if (cached && now - cached.timestamp < CACHE_EXPIRATION) {
      console.info(`Returning cached permissions for userId:#${userId}`);
      return new UserPermissionStrategy(cached.permissions);
    }

    const permissions = await fetchPermissionsFromApi(userId);
    cache[userId] = { permissions, timestamp: now };

    return new UserPermissionStrategy(permissions);
  }
  static clearCache(userId?: string): void {
    if (!userId) {
      console.info('Clearing all cache');
      Object.keys(cache).forEach((key) => delete cache[key]);
      return;
    }
    console.info(`Clearing cache for userId:#${userId}`);
    delete cache[userId];
  }
}
