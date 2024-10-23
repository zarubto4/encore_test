import { z } from "zod";
import { defaultGroupon_bToken, defaultGroupon_userId } from "../../../../libs/core/parsing_and_formating/defaultValidators";
import { IRBACPermission } from "../../../../libs/core/rbac/models";

/** Request ============================================================================================================*/

export interface IRBACValidationRequest {
  b_token: string;
  permission: IRBACPermission;
}

// Validator for Rest Api - Create Template
export const _v_RBACValidationRequestValidator = z.object({
  user_id: defaultGroupon_userId,
  b_token: defaultGroupon_bToken,
});

/** Return public model ------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Return Template (Public fields)
export interface IRBACValidationResponse {
  user_id: string;
  valid: boolean;
  not_valid_and_why?: string | null;
}

// Model for Rest Api - Return Template (Public fields)
export class RBACValidationResponseClass implements IRBACValidationResponse {
  user_id: string;
  valid: boolean;
  not_valid_and_why?: string | null;

  constructor(request: IRBACValidationResponse) {
    this.user_id = request.user_id;
    this.valid = request.valid;
    this.not_valid_and_why = request.not_valid_and_why;
  }
}

/** Request - Convert B Token  ======================================================================================== */

export interface IRBACConvertTokenRequest {
  b_token: string;
}

// Validator for Rest Api - Create Template
export const _v_IRBACConvertTokenRequest = z.object({
  b_token: defaultGroupon_bToken,
});

/** Return public model ------------------------------------------------------------------------------------------------*/

// Template for Rest Api - Return Template (Public fields)
export interface IRBACConvertTokenResponse {
  success?: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  error?: string;
}
