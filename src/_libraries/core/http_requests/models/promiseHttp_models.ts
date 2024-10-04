

export interface PromiseHeaders {
    [key: string]: any
}

export interface PromiseError {
    response: {};
    code: number | undefined;
    message: string | undefined;
}


export interface PromiseResponse<T> {
    error?: PromiseError | null;
    data?: T | null;
}

export interface PromiseRequest {
    url: string;
    type: ('POST' | 'PUT' | 'GET' | 'DELETE');
    body?: {} | null;
    query?: {} | null;
    expectedHttpNumber: number
}
