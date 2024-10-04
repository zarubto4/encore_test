import {api, APIError, ErrCode, Header} from "encore.dev/api";
import {appMeta, currentRequest} from "encore.dev";
import log from "encore.dev/log";
import {my_service_three} from "~encore/clients";
import { z } from "zod";



// ---- Request ----------------------------------------------------
// Basic Description about this Default Request
export interface DefaultRequest{
    // User name description
    username: string;
    name: string;
    test: string;
}

const DefaultValidRequest = z.object({
    username: z.string().email(),
    name: z.string(),
    test: z.string().min(4).max(10)
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
export const hallo1 = api({expose: true, method: "POST", path: "/hello"}, async (request: DefaultRequest): Promise<DefaultResponse> => {
        const parsing = validator.validate(request); // Valid incoming Request
        return { message: "Hello world!"};
    }
);


const validator = {
    validate: (request: DefaultRequest): z.infer<typeof DefaultValidRequest> => {
        const parsing = DefaultValidRequest.safeParse(request); // Valid incoming Request
        if (parsing.error) {
            //console.log("Co je špatně?:", parsing.error);
            console.log("Co je špatně? message:", parsing.error.errors);
            //  throw new APIError(ErrCode.InvalidArgument, JSON.stringify(parsing.error.errors));
            return {
                username: "string",
                name: "string",
                test: "string",
            };
        }
        return parsing.data;
    }
}


