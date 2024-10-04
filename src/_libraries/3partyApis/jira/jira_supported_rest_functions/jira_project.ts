import {Version3Client} from "jira.js";
import {Project}            from "jira.js/src/version3/models/project";
import {SearchProjects}     from "jira.js/src/version3/parameters/searchProjects";
import {GetProject}         from "jira.js/src/version3/parameters";
import { CommonJira }       from "../utils/jira_commonUtils";

export class ProjectJira extends CommonJira {

    constructor(protected jiraClient: Version3Client) {
        super();
    }

    public getProject(search: GetProject): Promise<Project | null> {
        return new Promise((resolve, reject): void => {
            this.jiraClient.projects.getProject(search, (error, data) => {

                if (data == undefined) {
                    console.error("getUser: dat undefined", "error:", error ? JSON.stringify(error.response) : "no error");
                    return resolve(null);
                }

                if (error) {
                    console.log("getProject: search", search, "error:", JSON.stringify(error.response));
                    resolve(null);
                    return
                }

                resolve(data);
            });
        });
    }

    public getAllProjects(search: SearchProjects): Promise<Project[]> {

        // Update search if something missing, for example "maxResults" or "startAt"
        this.setProperlySearchIfSomethingIsMissing(search);

        // Create Promise to unblock threads - and build a recursive structure that can retrieve all pages of results.
        return new Promise((resolve, reject): void => {

            this.jiraClient.projects.searchProjects(search, (error, data) => {

                if (data == undefined) {
                    console.error("getAllProjects: dat undefined", "error:", error ? JSON.stringify(error.response) : "no error");
                    return resolve([]);
                }

                if (error) {
                    console.error("getUsers: data:", data, "error:", JSON.stringify(error.response));
                    return resolve([]);
                }


                // If there is more pages with results, call next page
                // else we are on latest page, return result
                if (this.isThereMoreResults(data)) {
                    const nextSearch = this.increaseSearchCondition(data, search)
                    this.getAllProjects(nextSearch)
                        .then((result) => {
                            resolve(data.values.concat(result));  // Merge the results and return them
                        });
                } else {
                    // console.log("getAllProjects - no more results");
                    return resolve(data.values);
                }
            }).then(r => {
                // Callback Done
            });
        });
    }

}
