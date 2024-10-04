


import {CommonJira} from "../utils/jira_commonUtils";
import {Version3Client}         from "jira.js";
import {User}                   from "jira.js/src/version3/models/user";
import {GetAllUsers, GetUser}   from "jira.js/src/version3/parameters";


export class UserJira extends CommonJira {

    constructor(protected jiraClient: Version3Client) {
        super();
    }

    public getUser(search: GetUser): Promise<User | null> {
        return new Promise((resolve, reject): void => {
            this.jiraClient.users.getUser(search, (error, data) => {

                if (data == undefined) {
                    console.error("getUser: dat undefined", "error:", error ? JSON.stringify(error.response) : "no error");
                    return resolve(null);
                }

                if (error) {
                    console.log("getUser: search", search, "error:", JSON.stringify(error.response));
                    resolve(null);
                    return
                }

                resolve(data);
            });
        });
    }

    public getUsers(search: GetAllUsers): Promise<User[]> {

        // Update search if something missing, for example "maxResults" or "startAt"
        this.setProperlySearchIfSomethingIsMissing(search);

        // Create Promise to unblock threads - and build a recursive structure that can retrieve all pages of results.
        return new Promise((resolve, reject): void => {
            this.jiraClient.users.getAllUsers(search, (error, data) => {

                if (data == undefined) {
                    console.error("getUsers: dat undefined", "error:", error ? JSON.stringify(error.response) : "no error");
                    return resolve([]);
                }

                if (error) {
                    console.error("getUsers: data:", data.length, "error:", JSON.stringify(error.response));
                    return resolve([]);
                }

                console.log("getUsers: size:", data.length);

                // if there is more pages with results, call next page
                // else we are on latest page, return result
                if (data.length >= 1000) {
                    search.startAt = search.startAt ? search.startAt + 1000 : 0;
                    this.getUsers(search)
                        .then((result) => {
                            return resolve(data.concat(result));  // Merge the results and return them

                        });
                } else {
                    return resolve(data);
                }
            }).then(r => {
                // Callback Done
            });
        });
    }

}
