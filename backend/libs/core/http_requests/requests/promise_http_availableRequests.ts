import { PromiseHeaders, PromiseQuery, PromiseRequest, PromiseResponse } from "../models/promiseHttp_models";
import https from "https";
import http from "node:http";
import { printPrettyArray } from "../../parsing_and_formating/printPrettyArray";

export class PromiseHttpAvailableRequests {
  constructor(
    protected readonly private_headers: PromiseHeaders,
    protected readonly basicUrl: string,
  ) {}

  public get<T>(url: string, query: PromiseQuery, expectedHttpNumber = 200): Promise<PromiseResponse<T>> {
    return this.request({
      url: this.basicUrl + url,
      type: "GET",
      body: null,
      query: query,
      expectedHttpNumber: expectedHttpNumber,
    });
  }

  public post<T>(url: string, query: PromiseQuery = {}, body: object = {}, expectedHttpNumber = 201): Promise<PromiseResponse<T>> {
    return this.request({
      url: this.basicUrl + url,
      type: "POST",
      body: body,
      query: query,
      expectedHttpNumber: expectedHttpNumber,
    });
  }

  public put<T>(url: string, query: PromiseQuery = {}, body: object = {}, expectedHttpNumber = 201): Promise<PromiseResponse<T>> {
    return this.request({
      url: this.basicUrl + url,
      type: "PUT",
      body: body,
      query: query,
      expectedHttpNumber: expectedHttpNumber,
    });
  }

  public remove<T>(url: string, expectedHttpNumber = 200): Promise<PromiseResponse<T>> {
    return this.request<T>({
      url: this.basicUrl + url,
      type: "DELETE",
      body: null,
      query: null,
      expectedHttpNumber: expectedHttpNumber,
    });
  }

  private stringifyQuery(obj: PromiseQuery): Record<string, string> {
    const result: Record<string, string> = {};
    // console.log("stringifyQuery - original ", obj);
    for (const key of Object.keys(obj)) {
      // console.log("stringifyQuery - key ", key, typeof obj[key]);
      if (Array.isArray(obj[key])) {
        result[key] = printPrettyArray(obj[key]);
      } else if (typeof obj[key] === "string") {
        result[key] = obj[key];
      } else if (typeof obj[key] === "boolean") {
        result[key] = obj[key] ? "true" : "false";
      } else if (typeof obj[key] === "number") {
        result[key] = obj[key] + "";
      } else {
        console.log("stringifyQuery - unsupported key: " + key);
      }
    }
    // console.log("stringifyQuery - result ", result);
    return result;
  }

  private request<T>(request: PromiseRequest): Promise<PromiseResponse<T>> {
    return new Promise((resolve): void => {
      if (request.query && this.stringifyQuery(request.query).toString().length > 0) {
        request.url = request.url + "?" + new URLSearchParams(this.stringifyQuery(request.query)).toString();
      }

      try {
        let requestType;
        if (request.url.includes("https:")) {
          requestType = https;
        } else {
          requestType = http;
        }

        const req = requestType.request(
          request.url,
          {
            method: request.type,
            headers: this.private_headers,
          },
          (resp) => {
            /** This construct is for large JSON **/
            let body = "";
            resp.on("data", (chunk) => {
              body += chunk;
            });

            resp.on("end", () => {
              if (resp.statusCode != request.expectedHttpNumber) {
                console.log("PromiseHttp:: error status code", resp.statusCode, "body:", body);
                console.log("PromiseHttp:: error status code", resp.statusCode, "body json:", body != null && body != "" ? JSON.parse(body) : "null");

                function isJson(str: string) {
                  try {
                    JSON.parse(str);
                  } catch (error) {
                    console.log("parsing Error: ", error);
                    return false;
                  }
                  return true;
                }

                return resolve({
                  error: {
                    message: resp.statusMessage,
                    code: resp.statusCode,
                    response: isJson(body) ? JSON.parse(body) : {},
                  },
                  data: body != null && body != "" ? JSON.parse(body) : {},
                });
              }
              if (body != null && body != "") {
                return resolve({
                  error: null,
                  data: JSON.parse(body),
                });
              } else {
                return resolve({
                  error: null,
                  data: null,
                });
              }
            });
          },
        );

        if (request.body) {
          req.write(JSON.stringify(request.body, null, 0));
        }

        req.on("error", (e) => {
          console.error("PromiseHttp: error", e);
          console.error(e);
          resolve({
            error: {
              response: {},
              code: 500,
              message: "CRITICAL SERVER SIDE ERROR",
            },
            data: null,
          });
        });
        req.end();
      } catch (error) {
        console.error("Request Error: ", error);
      }
    });
  }
}
