import {api} from "encore.dev/api";
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
        return { message: "Hello world!", ... parsing};
    }
);


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
    }
}


