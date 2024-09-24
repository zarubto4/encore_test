import {api, APIError, Header} from "encore.dev/api";
import {appMeta, currentRequest} from "encore.dev";
import log from "encore.dev/log";

/**
 * Basic Description
 */
export const hi = api({expose: true, method: "GET", path: "/hi/:name"}, async (params: DefaultRequest): Promise<DefaultResponse> => {
        const msg = `hi ${params.name}! From service 1`;
        return { message: msg };
    }
);

interface DefaultRequest {
    name: string,
    test: string
}

export interface DefaultResponse {
    message: string;
}
