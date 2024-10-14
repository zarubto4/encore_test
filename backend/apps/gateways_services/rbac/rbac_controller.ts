import { IRBACValidationRequest, IRBACValidationResponse } from "./models/rbac.models";
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
