import {PromiseHttp} from "../../../core/http_requests/promise_http_request";
import {AsanaTicketResult, ProjectSection, ProjectSectionResult} from "../models/asana_resultsModels";
import {CreateStory} from "../models/asana_requestsModels";


export class AsanaServiceComments {

    constructor(protected request: PromiseHttp) {}

    public async createComment(task_gid: string, data: CreateStory) : Promise<AsanaTicketResult | null> {
           return await this.request.post<AsanaTicketResult>('1.0/tasks/' + task_gid + '/stories', {}, {
                data: data
            },  201)
                .then((result) => {
                    if (result.error) {
                        console.log("createTask error:", result.error);
                        return <AsanaTicketResult>{"error": "error"};
                    } else {
                        return result.data ? result.data : null;
                    }
                });
    }

}
