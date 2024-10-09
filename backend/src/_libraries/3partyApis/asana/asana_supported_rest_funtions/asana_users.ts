import {PromiseHttp} from "../../../core/http_requests/promise_http_request";
import {AsanaUsersResult,} from "../models/asana_resultsModels";

export class AsanaServiceUsers{

    constructor(protected request: PromiseHttp) {}

    public getAsanaUser() : Promise<AsanaUsersResult> {
        return new Promise((resolve): void => {

            const request = {
                'opt_fields': "email,name"
            };
            this.request.get<AsanaUsersResult>('1.0/workspaces/8437193015852/users', request, 200)
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


                    const userResult: AsanaUsersResult = result.data as AsanaUsersResult ;
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
        return new Promise((resolve): void => {

            const request = {};
            const body = {
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
