import { IRBACValidationRequest, IRBACValidationResponse, RBACValidationResponseClass } from "../models/rbac.models";
import { RequestMeta } from "encore.dev";

export class RbacService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async valid(request: IRBACValidationRequest, metaData?: RequestMeta): Promise<IRBACValidationResponse> {
    return new RBACValidationResponseClass({
      user_id: request.user_id,
      valid: true,
      not_valid_and_why: null,
    });
  }
}
