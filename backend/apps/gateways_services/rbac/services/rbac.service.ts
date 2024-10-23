import {
  IRBACConvertTokenRequest,
  IRBACConvertTokenResponse,
  IRBACValidationRequest,
  IRBACValidationResponse,
  RBACValidationResponseClass,
} from "../models/rbac.models";
import { RequestMeta } from "encore.dev";
import log from "encore.dev/log";

export class RbacService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async valid(request: IRBACValidationRequest, metaData?: RequestMeta): Promise<IRBACValidationResponse> {
    log.trace("valid", request);
    //TODO only for DEMO!
    return new RBACValidationResponseClass({
      user_id: request.user_id,
      valid: true,
      not_valid_and_why: null,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async convert(request: IRBACConvertTokenRequest, metaData?: RequestMeta): Promise<IRBACConvertTokenResponse> {
    log.trace("convert", request);
    //TODO only for DEMO!
    switch (request.b_token) {
      case "XXX": {
        return {
          success: {
            user_id: "123",
            email: "c_tzaruba@groupon.com",
            first_name: "Tomas",
            last_name: "Zaruba",
          },
        };
      }
      case "YYY": {
        return {
          success: {
            user_id: "124",
            email: "tvuthien@groupon.com",
            first_name: "Trang",
            last_name: "Vu Thien",
          },
        };
      }
      default: {
        return {
          error: "Invalid b Token - Only XXX and YYY is allowed",
        };
      }
    }
  }
}
