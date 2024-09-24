import {api, APIError, Header} from "encore.dev/api";
import {appMeta, currentRequest} from "encore.dev";
import log from "encore.dev/log";
import { my_service_three } from "~encore/clients";

/**
 * Basic Description
 */
export const hello = api({expose: true, method: "GET", path: "/hello/:name"}, async (params: DefaultRequest): Promise<DefaultResponse> => {
        const msg = `Hello ${params.name}! From service 1`;

        console.log(""); // New line
        log.trace("Metadata:", appMeta());

        console.log(""); // New line
        log.trace("Metadata:", {"call" : currentRequest()?.type ?? "not found" });

        console.log(""); // New line
        audit("sdasdasd", {"key": "value", "s": "sa"});

        if(params.name == "test") {
            throw APIError.notFound("url not found");
        }

        console.log(""); // New line
        log.info("log message", {is_subscriber: true})
        // log.error("err", "something went terribly wrong!")

        const { message: service_three_resp } = await my_service_three.hello3({ name: 'xxx', test: 'test '});

        return { message: JSON.stringify({ msg, service_three_resp }) };
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
