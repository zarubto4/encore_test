export type PromiseHeaders = Record<string, string | string[]>;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface PromiseQuery {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface PromiseError {
  response: undefined;
  code: number | undefined;
  message: string | undefined;
}

export interface PromiseResponse<T> {
  error?: PromiseError | null;
  data?: T | null;
}

export interface PromiseRequest {
  url: string;
  type: "POST" | "PUT" | "GET" | "DELETE";
  body?: object | null;
  query?: PromiseQuery | null;
  expectedHttpNumber: number;
}
