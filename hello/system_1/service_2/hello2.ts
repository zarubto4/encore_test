import {api, APIError, ErrCode, Header} from "encore.dev/api";
import {DefaultResponse} from "../service_1/hello";
import { my_service_one } from "~encore/clients"; // import 'hello' service



export const test = api<Request2, DefaultResponse >({ expose: true, method: "GET", path: "/hello2/:name"}, async (params)=> {
        const msg = `Hello ${params.name}!`;
        console.log("HEader ", params.language);

        const resp = await my_service_one.get({ name: "World", test: "test"});

      // throw new APIError(ErrCode.NotFound, "sprocket not found");

        console.log("result middle:", resp);

        return { message: msg };
    }
);

interface Request2 {
    language: Header<"header-test">; // parsed from header
    name: string; // not a header
}

