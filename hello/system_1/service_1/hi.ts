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


async function audit(userID: string, event: Record<string, any>) {
    const cloud = appMeta().environment.cloud;
    switch (cloud) {
        case "aws":
            return; // writeIntoRedshift(userID, event);
        case "gcp":
            return; //writeIntoBigQuery(userID, event);
        case "local":
            return; // writeIntoFile(userID, event);
        default:
            throw new Error(`unknown cloud: ${cloud}`);
    }
}
