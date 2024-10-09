import {Version3Client} from "jira.js";
import * as Parameters from "jira.js/src/version2/parameters";
import * as Models from "jira.js/src/version2/models";
import {CommonJira} from "../utils/jira_commonUtils";

export class IssueComments extends CommonJira {

    constructor(protected jiraClient: Version3Client) {
        super();
    }

    public createComment(addComment:  Parameters.AddComment): Promise<Models.Comment> {
        return new Promise((resolve, reject): void => {
            this.jiraClient.issueComments.addComment(addComment, (error, data) => {

                if  (data == undefined) {
                    console.log("createComment:", addComment, "error - data undefined", data, error);
                    return reject(error);

                }

                if (error) {
                    console.log("createComment:", addComment, "error:", JSON.stringify(error.response));
                    return reject(error);

                }
                resolve(data);
            });
        });
    }




}
