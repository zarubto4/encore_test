import {PromiseHttpAvailableRequests} from "./requests/promise_http_availableRequests";


export class PromiseHttp extends PromiseHttpAvailableRequests{

    public constructor(basicUrl: string, token: string | null, headers: {} = {}) {
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
            console.log('PromiseHttp: token:', token)
            this.private_headers['Authorization'] = 'Bearer ' + token;
        }
    }


}
