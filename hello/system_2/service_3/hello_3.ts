import { api, Header } from "encore.dev/api";
import { appMeta, currentRequest } from "encore.dev";
import log from "encore.dev/log";

export const hello3 = api(
  { expose: true, method: "GET", path: "/hello3/:name" },
  async (params: DefaultRequest): Promise<DefaultResponse> => {
    const msg = `Hello ${params.name}! From service 3`;
    return { message: msg };
  }
);

interface DefaultRequest {
  name: string;
  test: string;
}

export interface DefaultResponse {
  message: string;
}
