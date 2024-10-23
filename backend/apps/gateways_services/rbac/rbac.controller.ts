import { IRBACConvertTokenRequest, IRBACConvertTokenResponse, IRBACValidationRequest, IRBACValidationResponse } from "./models/rbac.models";
import { RbacService } from "./services/rbac.service";
import { currentRequest } from "encore.dev";
import log from "encore.dev/log";
import { api } from "encore.dev/api";

// Services ------------------------------------------------------------------------------------------------------------
const rbacService = new RbacService();

// Apis ----------------------------------------------------------------------------------------------------------------
/**
 * Valid Incoming Private Request (For Internal Use)
 */
export const validPermission = api(
  { expose: false, method: "PUT", path: "/rbac/valid_permission" },
  async (params: IRBACValidationRequest): Promise<IRBACValidationResponse> => {
    const result = await rbacService.valid(params, currentRequest());
    log.trace("validPermission", result);
    return result;
  },
);

/**
 * Convert & Valid Incoming Private Request (For Internal Use)
 * - User from b_token
 */
export const convertUserBToken = api(
  { expose: false, method: "PUT", path: "/rbac/convert_b_token" },
  async (params: IRBACConvertTokenRequest): Promise<IRBACConvertTokenResponse> => {
    const result = await rbacService.convert(params, currentRequest());
    log.trace("convertBToken", result);
    return result;
  },
);
