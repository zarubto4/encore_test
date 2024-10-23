import { currentRequest } from "encore.dev";
import { gatewayService_rbac } from "~encore/clients";
import { getAuthData } from "~encore/auth";
import { APIError } from "encore.dev/api";
import log from "encore.dev/log";
import { ObjectId } from "mongodb";
import { UUID } from "node:crypto";
import { IRBACPermission } from "../../../../libs/core/rbac/models";

/**
 * With Exception
 * @param permission
 * @param id
 * @param exception Default true with Exception Emit. Set False for If conditions
 */
export async function rbacRequiredUserSignature(permission: IRBACPermission, id: ObjectId | null, exception = true): Promise<boolean> {
  const auth = getAuthData();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const metaData = currentRequest();

  log.trace("permissionKey", { permission: permission, object_id: id, ...auth });

  if (auth) {
    const result = await gatewayService_rbac.validPermission({
      b_token: auth.b_token,
      permission: injectIdIfAvailable(permission, id),
    });

    if (result.valid) {
      log.trace("permissionKey", { permissionKey: permission, object_id: id, rbac_result: result });
      return true;
    } else {
      log.error("permissionKey - is not valid or allowed", { permissionKey: permission, object_id: id, rbac_result: result });
      if (exception) {
        throw APIError.unauthenticated("RBAC Not valid permission key" + permission);
      } else {
        return false;
      }
    }
  } else {
    log.error("permissionKey - missing", { permissionKey: permission, object_id: id });
    if (exception) {
      throw APIError.unauthenticated("RBAC - not valid or missing permission");
    } else {
      return false;
    }
  }
}

function injectIdIfAvailable(permission: IRBACPermission, id?: ObjectId | UUID | string | null): IRBACPermission {
  if (id && ObjectId.isValid(id)) {
    return {
      scopeType: permission.scopeType, // Application name like DCT, RBAC, MC etc.
      scopeValue: id instanceof ObjectId ? id.toHexString() : id.toString(), // Resource ID (like Merchant ID, or Object ID) or Resource Type
      permission: permission.permission, // Permission Key
    };
  } else if (id && typeof id === "string") {
    return {
      scopeType: permission.scopeType,
      scopeValue: id,
      permission: permission.permission,
    };
  } else if (id && id.toString().length == 36) {
    return {
      scopeType: permission.scopeType,
      scopeValue: id.toString(),
      permission: permission.permission,
    };
  } else {
    return permission;
  }
}
