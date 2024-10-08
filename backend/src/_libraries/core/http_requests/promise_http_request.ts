import {PromiseHttpAvailableRequests} from "./requests/promise_http_availableRequests";


export class PromiseHttp extends PromiseHttpAvailableRequests{

    public constructor(basicUrl: string, token: string | null, headers: Record<string, string | string[]> = {}) {
        super(
            {
                ... {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                ...headers
            },
            basicUrl
        )

        if (token) {
            this.private_headers['Authorization'] = 'Bearer ' + token;
        }
    }


}
