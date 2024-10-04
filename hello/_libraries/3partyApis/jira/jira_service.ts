
import {ProjectJira} from "./jira_supported_rest_functions/jira_project";
import {IssuesJira} from "./jira_supported_rest_functions/jira_issues";
import {UserJira} from "./jira_supported_rest_functions/jira_user";
import {AuthenticationForJira} from "./models/jira_config";
import {Version3Client} from "jira.js";
import {IssueComments} from "./jira_supported_rest_functions/jira_issue_comments";

export class JiraService {

    private readonly host: string = 'https://groupondev.atlassian.net';

    // Helpers - Jira
    private readonly _jiraClient: Version3Client;
    private readonly _jiraProject: ProjectJira;
    private readonly _jiraIssue: IssuesJira;
    private readonly _jiraUser: UserJira;
    private readonly _jiraIssueComment: IssueComments;

    constructor(auth: AuthenticationForJira) {
        this._jiraClient = new Version3Client({
            host: this.host,
            authentication: {
                basic: {
                    email: auth.email,
                    apiToken:auth.apiToken
                },
            },
        })

        this._jiraProject = new ProjectJira(this._jiraClient);
        this._jiraIssue = new IssuesJira(this._jiraClient);
        this._jiraUser =  new UserJira(this._jiraClient);
        this._jiraIssueComment =  new IssueComments(this._jiraClient);
    }

    get project(): ProjectJira {
        return this._jiraProject;
    }

    get issue(): IssuesJira {
        return this._jiraIssue;
    }

    get user(): UserJira {
        return this._jiraUser;
    }
      get comments(): IssueComments {
        return this._jiraIssueComment;
    }

}
