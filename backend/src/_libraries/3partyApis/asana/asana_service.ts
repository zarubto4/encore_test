import {PromiseHttp} from "../../core/http_requests/promise_http_request";
import {AuthenticationForAsana} from "./models/asana_configModels";
import {AsanaServiceTasks} from "./asana_supported_rest_funtions/asana_tasks";
import {AsanaServiceProjects} from "./asana_supported_rest_funtions/asana_projects";
import {AsanaServiceComments} from "./asana_supported_rest_funtions/asana_comments";
import {AsanaServiceUsers} from "./asana_supported_rest_funtions/asana_users";

export class AsanaService {

    private readonly apiUrl = 'https://app.asana.com/api/';
    private readonly request: PromiseHttp;
    private readonly _tasks: AsanaServiceTasks;
    private readonly _projects: AsanaServiceProjects;
    private readonly _comments: AsanaServiceComments;
    private readonly _users: AsanaServiceUsers;


    constructor(authenticationAsana: AuthenticationForAsana) {
        this.request = new PromiseHttp(this.apiUrl, authenticationAsana.accessToken);
        this._tasks = new AsanaServiceTasks(this.request);
        this._projects = new AsanaServiceProjects(this.request);
        this._comments = new AsanaServiceComments(this.request);
        this._users = new AsanaServiceUsers(this.request);
    }

    get tasks(): AsanaServiceTasks {
        return this._tasks;
    }

    get projects(): AsanaServiceProjects {
        return this._projects;
    }

    get comments(): AsanaServiceComments {
        return this._comments;
    }

    get users(): AsanaServiceUsers {
        return this._users;
    }

}
