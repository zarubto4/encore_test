import { api } from "encore.dev/api";
import { z } from "zod";
import log from "encore.dev/log";
import { streamLine_sub_clientMessage } from "../../gateways_services/streamLine/encore.service";

/**
 * Basic Description
 */
export const api_controller = api(
  { expose: true, method: "GET", path: "/hi/:name" },
  async (params: DefaultRequest1): Promise<DefaultResponse> => {
    const msg = `hi ${params.name}! From service 1`;

    log.trace("Incoming Message");

    await streamLine_sub_clientMessage.publish({
      user_id: params.name,
      connection_session_id: params.name,
      service: "global_deal_framework",
      topic: "topic",
      message: {
        msg: params.name,
      },
    });

    return { message: msg };
  },
);

interface DefaultRequest1 {
  name: string;
}

// ---- Request ----------------------------------------------------
// Basic Description about this Default Request
export interface DefaultRequest {
  // User name description
  username: string;
  name: string;
  test: string;
}

const DefaultValidRequest = z.object({
  username: z.string().email(),
  name: z.string(),
  test: z.string().min(4).max(10),
});

// ---- Response ----------------------------------------------------
// Basic Description about this Default Response
export interface DefaultResponse {
  message: string;
}

/**
 * Hello1 Best API description
 * @param {object} request - Incoming Request
 * @param {string} request.test - Testing Parameter
 */
export const hallo1 = api({ expose: true, method: "POST", path: "/hello" }, async (request: DefaultRequest): Promise<DefaultResponse> => {
  const parsing = validator.validate(request); // Valid incoming Request
  return { message: "Hello world!", ...parsing };
});

const validator = {
  validate: (request: DefaultRequest): z.infer<typeof DefaultValidRequest> => {
    const parsing = DefaultValidRequest.safeParse(request); // Valid incoming Request
    if (parsing.error) {
      // throw new APIError(ErrCode.InvalidArgument, JSON.stringify(parsing.error.errors));
      return {
        username: "string",
        name: "string",
        test: "string",
      };
    }
    return parsing.data;
  },
};
