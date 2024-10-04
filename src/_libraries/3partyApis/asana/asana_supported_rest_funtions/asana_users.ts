import {PromiseHttp} from "../../../core/http_requests/promise_http_request";
import {AuthenticationForAsana} from "../models/asana_configModels";
import {
    AsanaTicketResult,
    AsanaTicketsListResult,
    AsanaUsersResult,
    ProjectSection,
    ProjectSectionResult
} from "../models/asana_resultsModels";
import {CreateStory, CreateTask, UpdateTask} from "../models/asana_requestsModels";

export class AsanaServiceUsers{

    constructor(protected request: PromiseHttp) {}

    public getAsanaUser() : Promise<AsanaUsersResult> {
        return new Promise((resolve, reject): void => {

            let request = {
                'opt_fields': "email,name"
            };
            this.request.get<AsanaUsersResult>('1.0/workspaces/8437193015852/users', request,   200)
                .then((result) => {

                    if (result.error) {
                        console.log("getAsanaUser error:", result.error);
                        resolve(
                            new AsanaUsersResult("Error")
                        );
                    }
                    if (!result.data) {
                        console.log("getAsanaUser missing data:", result.error, result.data);
                        resolve(
                            new AsanaUsersResult("Error")
                        );
                    }


                    let userResult: AsanaUsersResult = <AsanaUsersResult> result.data ;
                    userResult.byMail = {};
                    userResult.byName = {};
                    userResult.byId = {};

                    userResult.data.forEach((user) => {
                        userResult.byMail[user.email] = user;
                        userResult.byName[user.name] = user;
                        userResult.byId[user.gid] = user;
                    });

                    resolve(userResult);
                });
        });
    }

    public removeFollowers(taskId: string, followers: string[]) : Promise<void> {
        return new Promise((resolve, reject): void => {

            let request = {
            };

            let body = {
                'data': {
                    'followers': followers
                }
            };
            this.request.post<AsanaUsersResult>('1.0/tasks/' + taskId + '/removeFollowers', request,  body,   200)
                .then((result) => {
                    if (result.error) {
                        console.log("removeFollowers error:", result.error);
                        resolve();
                    } else {
                        resolve();
                    }
                });
        });
    }
}
