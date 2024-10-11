import { handleError } from 'libs/stdlib/src';
import { Api, RoleIdResponse, SecurityData } from 'libs/rbac-client/src';

export const resolveRoleIds = async (roleIds: string[], api: Api<SecurityData>) => {
  const uniqueRoleIds = [...new Set(roleIds)];
  const rolePromises = uniqueRoleIds.map(async (roleId) => {
    try {
      const { data } = await api.v2.rolesDetail(roleId, { show: 'minimal' });
      const { permissions, categories, ...role } = data;
      if (!role) throw new Error(`Role with ID ${roleId} not found`);
      return { [roleId]: role };
    } catch (error) {
      return { [roleId]: { message: handleError(error) } };
    }
  });

  const resolvedRoles = await Promise.all(rolePromises);
  return resolvedRoles.reduce((acc, role) => {
    const key = Object.keys(role)[0];
    acc[key] = role[key];
    return acc;
  }, {} as Record<string, RoleIdResponse>);
};
