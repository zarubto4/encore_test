import { api, APIError, ErrCode, Header } from "encore.dev/api";
import { DefaultResponse } from "../service_1/hello";
import { my_service_one } from "~encore/clients";


/**
 *
 */
export const hello2 = api<Request, DefaultResponse>({ expose: true, method: "GET", path: "/hello2" }, async (params) => {
    const msg = `Hello ${params.name}! From service 2`;
   // console.log("header ", params.language);

    const { message: service_one_resp } = await my_service_one.hallo1({ name: "World", test: "test" , username: "asdasd"});

    const message = JSON.stringify({ msg, service_one_resp });

    // throw new APIError(ErrCode.NotFound, "sprocket not found");
    return { message };
  }
);

interface Request {
  // language: Header<"header-test">; // parsed from header
  name: string; // not a header
}
