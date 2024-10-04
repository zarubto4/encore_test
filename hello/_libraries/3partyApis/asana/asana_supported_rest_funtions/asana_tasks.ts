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

export class AsanaServiceTasks {

    constructor(protected request: PromiseHttp) {}


    public getTask(task_gid: string) : Promise<AsanaTicketResult | null> {

        return new Promise((resolve, reject): void => {

            console.log("getTask: gid", task_gid);

            let request = {
                'opt_fields': "notes,html_notes,actual_time_minutes,approval_status,assignee,assignee.name,assignee_section,assignee_section.name,assignee_status,completed,completed_at,completed_by,completed_by.name,created_at,created_by,custom_fields,custom_fields.asana_created_field,custom_fields.created_by,custom_fields.created_by.name,custom_fields.currency_code,custom_fields.custom_label,custom_fields.custom_label_position,custom_fields.date_value,custom_fields.date_value.date,custom_fields.date_value.date_time,custom_fields.description,custom_fields.display_value,custom_fields.enabled,custom_fields.enum_options,custom_fields.enum_options.color,custom_fields.enum_options.enabled,custom_fields.enum_options.name,custom_fields.enum_value,custom_fields.enum_value.color,custom_fields.enum_value.enabled,custom_fields.enum_value.name,custom_fields.format,custom_fields.has_notifications_enabled,custom_fields.id_prefix,custom_fields.is_formula_field,custom_fields.is_global_to_workspace,custom_fields.is_value_read_only,custom_fields.multi_enum_values,custom_fields.multi_enum_values.color,custom_fields.multi_enum_values.enabled,custom_fields.multi_enum_values.name,custom_fields.name,custom_fields.number_value,custom_fields.people_value,custom_fields.people_value.name,custom_fields.precision,custom_fields.representation_type,custom_fields.resource_subtype,custom_fields.text_value,custom_fields.type,dependencies,dependents,due_at,due_on,external,external.data,followers,followers.name,hearted,hearts,hearts.user,hearts.user.name,is_rendered_as_separator,liked,likes,likes.user,likes.user.name,memberships,memberships.project,memberships.project.name,memberships.section,memberships.section.name,modified_at,name,num_hearts,num_likes,num_subtasks,parent,parent.created_by,parent.name,parent.resource_subtype,permalink_url,projects,projects.name,resource_subtype,start_at,start_on,tags,tags.name,workspace,workspace.name"
            };

            this.request.get<AsanaTicketResult>('1.0/tasks/' + task_gid, request, 200)
                .then((result) => {
                    console.log("getTask: gid", task_gid, "response - done");

                    if (result.error) {
                        console.log("getTask error:", result.error)
                        resolve(<AsanaTicketResult>{"error": "error"});
                    } else {
                        resolve(result.data ? result.data : null)
                    }
                });
        });
    }

    public updateTask(task_gid: string, task: UpdateTask) : Promise<AsanaTicketResult | null> {

        return new Promise((resolve, reject): void => {

            console.log("updateTask: gid", task_gid);

            let request = {
                'opt_fields': "notes,html_notes,actual_time_minutes,approval_status,assignee,assignee.name,assignee_section,assignee_section.name,assignee_status,completed,completed_at,completed_by,completed_by.name,created_at,created_by,custom_fields,custom_fields.asana_created_field,custom_fields.created_by,custom_fields.created_by.name,custom_fields.currency_code,custom_fields.custom_label,custom_fields.custom_label_position,custom_fields.date_value,custom_fields.date_value.date,custom_fields.date_value.date_time,custom_fields.description,custom_fields.display_value,custom_fields.enabled,custom_fields.enum_options,custom_fields.enum_options.color,custom_fields.enum_options.enabled,custom_fields.enum_options.name,custom_fields.enum_value,custom_fields.enum_value.color,custom_fields.enum_value.enabled,custom_fields.enum_value.name,custom_fields.format,custom_fields.has_notifications_enabled,custom_fields.id_prefix,custom_fields.is_formula_field,custom_fields.is_global_to_workspace,custom_fields.is_value_read_only,custom_fields.multi_enum_values,custom_fields.multi_enum_values.color,custom_fields.multi_enum_values.enabled,custom_fields.multi_enum_values.name,custom_fields.name,custom_fields.number_value,custom_fields.people_value,custom_fields.people_value.name,custom_fields.precision,custom_fields.representation_type,custom_fields.resource_subtype,custom_fields.text_value,custom_fields.type,dependencies,dependents,due_at,due_on,external,external.data,followers,followers.name,hearted,hearts,hearts.user,hearts.user.name,is_rendered_as_separator,liked,likes,likes.user,likes.user.name,memberships,memberships.project,memberships.project.name,memberships.section,memberships.section.name,modified_at,name,num_hearts,num_likes,num_subtasks,parent,parent.created_by,parent.name,parent.resource_subtype,permalink_url,projects,projects.name,resource_subtype,start_at,start_on,tags,tags.name,workspace,workspace.name"
            };

            let body = {
                data: task
            };

            this.request.put<AsanaTicketResult>('1.0/tasks/' + task_gid, request, body, 200)
                .then((result) => {
                    console.log("updateTask: gid", task_gid, "response - done");

                    if (result.error) {
                        console.log("getTask error:", result.error)
                        resolve(<AsanaTicketResult>{"error": "error"});
                    } else {
                        resolve(result.data ? result.data : null)
                    }
                });
        });
    }

    public getAllTasks(search: {project?: string}) : Promise<AsanaTicketsListResult | null> {

        return new Promise((resolve, reject): void => {

            console.log("getAllTasks: search", search);

            let request = {
                ... search,
                ...{
                    'opt_fields': "notes,html_notes,actual_time_minutes,approval_status,assignee,assignee.name,assignee_section,assignee_section.name,assignee_status,completed,completed_at,completed_by,completed_by.name,created_at,created_by,custom_fields,custom_fields.asana_created_field,custom_fields.created_by,custom_fields.created_by.name,custom_fields.currency_code,custom_fields.custom_label,custom_fields.custom_label_position,custom_fields.date_value,custom_fields.date_value.date,custom_fields.date_value.date_time,custom_fields.description,custom_fields.display_value,custom_fields.enabled,custom_fields.enum_options,custom_fields.enum_options.color,custom_fields.enum_options.enabled,custom_fields.enum_options.name,custom_fields.enum_value,custom_fields.enum_value.color,custom_fields.enum_value.enabled,custom_fields.enum_value.name,custom_fields.format,custom_fields.has_notifications_enabled,custom_fields.id_prefix,custom_fields.is_formula_field,custom_fields.is_global_to_workspace,custom_fields.is_value_read_only,custom_fields.multi_enum_values,custom_fields.multi_enum_values.color,custom_fields.multi_enum_values.enabled,custom_fields.multi_enum_values.name,custom_fields.name,custom_fields.number_value,custom_fields.people_value,custom_fields.people_value.name,custom_fields.precision,custom_fields.representation_type,custom_fields.resource_subtype,custom_fields.text_value,custom_fields.type,dependencies,dependents,due_at,due_on,external,external.data,followers,followers.name,hearted,hearts,hearts.user,hearts.user.name,is_rendered_as_separator,liked,likes,likes.user,likes.user.name,memberships,memberships.project,memberships.project.name,memberships.section,memberships.section.name,modified_at,name,num_hearts,num_likes,num_subtasks,parent,parent.created_by,parent.name,parent.resource_subtype,permalink_url,projects,projects.name,resource_subtype,start_at,start_on,tags,tags.name,workspace,workspace.name"
                }
            };

            this.request.get<AsanaTicketsListResult>('1.0/tasks', request, 200)
                .then((result) => {
                    console.log("getAllTasks: gid", "response - done", result);

                    if (result.error) {
                        console.log("getTask error:", result.error)
                        resolve(<AsanaTicketsListResult>{"error": "error"});
                    } else {
                        resolve(result.data ? result.data : null);
                    }
                });
        });
    }

    public getAllSubTasks(taskId?: string) : Promise<AsanaTicketsListResult | null> {

        return new Promise((resolve, reject): void => {

            // console.log("getAllSubTasks: taskId", taskId);

            let request = {
                ...{
                    'opt_fields': "notes,html_notes,actual_time_minutes,approval_status,assignee,assignee.name,assignee_section,assignee_section.name,assignee_status,completed,completed_at,completed_by,completed_by.name,created_at,created_by,custom_fields,custom_fields.asana_created_field,custom_fields.created_by,custom_fields.created_by.name,custom_fields.currency_code,custom_fields.custom_label,custom_fields.custom_label_position,custom_fields.date_value,custom_fields.date_value.date,custom_fields.date_value.date_time,custom_fields.description,custom_fields.display_value,custom_fields.enabled,custom_fields.enum_options,custom_fields.enum_options.color,custom_fields.enum_options.enabled,custom_fields.enum_options.name,custom_fields.enum_value,custom_fields.enum_value.color,custom_fields.enum_value.enabled,custom_fields.enum_value.name,custom_fields.format,custom_fields.has_notifications_enabled,custom_fields.id_prefix,custom_fields.is_formula_field,custom_fields.is_global_to_workspace,custom_fields.is_value_read_only,custom_fields.multi_enum_values,custom_fields.multi_enum_values.color,custom_fields.multi_enum_values.enabled,custom_fields.multi_enum_values.name,custom_fields.name,custom_fields.number_value,custom_fields.people_value,custom_fields.people_value.name,custom_fields.precision,custom_fields.representation_type,custom_fields.resource_subtype,custom_fields.text_value,custom_fields.type,dependencies,dependents,due_at,due_on,external,external.data,followers,followers.name,hearted,hearts,hearts.user,hearts.user.name,is_rendered_as_separator,liked,likes,likes.user,likes.user.name,memberships,memberships.project,memberships.project.name,memberships.section,memberships.section.name,modified_at,name,num_hearts,num_likes,num_subtasks,parent,parent.created_by,parent.name,parent.resource_subtype,permalink_url,projects,projects.name,resource_subtype,start_at,start_on,tags,tags.name,workspace,workspace.name"
                }
            };

            this.request.get<AsanaTicketsListResult>('1.0/tasks/' + taskId + "/subtasks", request, 200)
                .then((result) => {
                    // console.log("getAllTasks: gid", "response - done", result);

                    if (result.error) {
                        console.log("getTask error:", result.error)
                        resolve(<AsanaTicketsListResult>{"error": "error"});
                    } else {
                        resolve(result.data ? result.data : null);
                    }
                });
        });
    }

    public createTask(data: CreateTask) : Promise<AsanaTicketResult | null> {
        return new Promise((resolve, reject): void => {

            this.request.post<AsanaTicketResult>('1.0/tasks', {}, {
                data: data
            },  201)
                .then((result) => {
                    if (result.error) {
                        console.log("createTask error:", result.error);
                        resolve(<AsanaTicketResult>{"error": "error"});
                    } else {
                        resolve(result.data ? result.data : null);
                    }
                });
        });
    }

    public createSubTask(parentId: string, data: CreateTask) : Promise<AsanaTicketResult | null> {
        return new Promise((resolve, reject): void => {
            this.request.post<AsanaTicketResult>('1.0/tasks/' + parentId + "/subtasks", {}, {
                data: data
            },  201)
                .then((result) => {
                    if (result.error) {
                        resolve(<AsanaTicketResult>{"error": "error"});
                    } else {
                        resolve(result.data ? result.data : null);
                    }
                });
        });
    }

}
