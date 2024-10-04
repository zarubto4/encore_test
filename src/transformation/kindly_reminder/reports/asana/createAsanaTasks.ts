import {Groupon_VPS} from "../userWorkSheet/prepareManagerStage";
import moment, {Moment} from "moment/moment.js";
import {ProjectStage} from "../projectWorkSheet/prepareProjectStatsStage.service";
import {GetIssueUserStatistics} from "../getIssues/getIssueStatistics";
import {AsanaIssueContent} from "./asanaIssueContent";
import {CreateTaskForIssuesOwner, CreateTaskForProjectOwner, CreateTaskForVP, GetListOfIssues} from "./_models";
import {
    kindlyReminder_asana_fallowers_to_remove,
    kindlyReminder_asana_project_id, kindlyReminder_asana_project_section_id,
    kindlyReminder_spreadSheetId,
    KindlyReminderConfigApp
} from "../../encore.service";
import {replaceKeys} from "../../../../_libraries/core/parsing_and_formating/stringInject";
import {AsanaTicketResult} from "../../../../_libraries/3partyApis/asana/models/asana_resultsModels";

export interface GenerateAsanaContent {
    week_number: number;
    created: Moment;
    deadline: Moment;
}

export class CreateAsanaTasks {


    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();

    // -- Constructor  -------------------------------------------------------------------------------------------------
    constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------

    public generateAsanaTasks(content: GenerateAsanaContent): Promise<void> {
        console.log("CreateAsanaTasks:generateAsanaTasks: init =========================================================");
        return new Promise(async(resolve, reject) => {

            const generatedIssues = await new GetIssueUserStatistics().getIssueUserStatistics(content.week_number);

            const worksheet_link: string = "https://docs.google.com/spreadsheets/d/" + kindlyReminder_spreadSheetId + "/edit?gid=" + generatedIssues.sheet.sheetId;
            const asana_ticket = await this.createWeekReportTask({
                week_number: content.week_number,
                deadline: content.deadline,
                worksheet_link: "https://docs.google.com/spreadsheets/d/" + kindlyReminder_spreadSheetId + "/edit?gid=" + generatedIssues.sheet.sheetId,
            });

            if (asana_ticket == null) {
                return reject("Missing Main Asana Ticket");
            }

            const projectWorkSheet = await new ProjectStage().loadProjects(content.week_number);
            const responseIssueUserLog = new GetIssueUserStatistics().getIssueUserStatistics(content.week_number);
            const asanaUsers = await  this.configApp.asanaService.users.getAsanaUser();

            for (const vicePresidentEmail of new Groupon_VPS().vps) {
                console.log("active VP:", vicePresidentEmail);
            }

            for (const key of Object.keys(generatedIssues.userLog)) {
                console.log("logged VPs:", key);
            }

            for (const vicePresidentEmail of new Groupon_VPS().vps) {
                        console.log("print by VP:", vicePresidentEmail);

                        if (generatedIssues.userLog[vicePresidentEmail]) {

                            console.log("vicePresidentEmail:", vicePresidentEmail);

                            let issueCounter: number = generatedIssues.userLog[vicePresidentEmail].issues_number;
                            if (issueCounter > 0) {
                                console.log("        creating task for week ", content.week_number);

                                const task = await this.createTaskForVP({
                                    owner_email: vicePresidentEmail,
                                    owner_name: generatedIssues.userLog[vicePresidentEmail].vpName,
                                    assign_gid: (asanaUsers.byMail[vicePresidentEmail]) ? asanaUsers.byMail[vicePresidentEmail].gid : null,
                                    week_number: content.week_number,
                                    deadline: content.deadline,
                                    created_as_string: content.created.format("dddd, MMMM Do, YYYY"),
                                    deadline_as_string: content.deadline.format("dddd, MMMM Do, YYYY"),
                                    number_of_issues: "" + generatedIssues.userLog[vicePresidentEmail].issues_number,
                                    worksheet_link: worksheet_link,
                                    parent_ticket_id: asana_ticket.data.gid,
                                    week_ticket_id: asana_ticket.data.gid,
                                    vPs_issues: generatedIssues.userLog[vicePresidentEmail].issues
                                });

                                if (task) {
                                    for (const prj of Object.keys(generatedIssues.userLog[vicePresidentEmail].projects)) {

                                        console.log("        responsible for project", prj);
                                        console.log("               creating ticket for owner", projectWorkSheet.projectOwnerShipOverview.byProject[prj].owner_name);
                                        console.log("               project owner", generatedIssues.userLog[vicePresidentEmail].projects[prj].project_owner_email);

                                        if (generatedIssues.userLog[vicePresidentEmail].projects[prj].issues_number > 0) {

                                            let assign_project_gid: string | null = null;
                                            if (generatedIssues.userLog[vicePresidentEmail].projects[prj] &&
                                                generatedIssues.userLog[vicePresidentEmail].projects[prj].project_owner_email &&
                                                asanaUsers.byMail[generatedIssues.userLog[vicePresidentEmail].projects[prj].project_owner_email]) {
                                                assign_project_gid = asanaUsers.byMail[generatedIssues.userLog[vicePresidentEmail].projects[prj].project_owner_email].gid;
                                            } else {
                                                assign_project_gid = (asanaUsers.byMail[vicePresidentEmail]) ? asanaUsers.byMail[vicePresidentEmail].gid : null;
                                            }

                                            const subTaskProjectIssue = await this.createTaskForProjectOwner(
                                                {
                                                    owner_name: generatedIssues.userLog[vicePresidentEmail].projects[prj].project_owner_name ?? "",
                                                    owner_email: generatedIssues.userLog[vicePresidentEmail].projects[prj].project_owner_email ?? "",
                                                    project_name: prj,
                                                    assign_gid: assign_project_gid,
                                                    week_number: content.week_number,
                                                    deadline: content.deadline,
                                                    created_as_string: content.created.format("dddd, MMMM Do, YYYY"),
                                                    deadline_as_string: content.deadline.format("dddd, MMMM Do, YYYY"),
                                                    number_of_issues: "" + generatedIssues.userLog[vicePresidentEmail].projects[prj].issues_number,
                                                    project_is_active: projectWorkSheet.allowedProjects.includes(prj),
                                                    worksheet_link: worksheet_link,
                                                    parent_ticket_id: task.data.gid,
                                                    week_ticket_id: asana_ticket.data.gid,
                                                    projectIssues: {
                                                        issues: generatedIssues.userLog[vicePresidentEmail].projects[prj].issues,
                                                        issues_number: generatedIssues.userLog[vicePresidentEmail].projects[prj].issues_number
                                                    }

                                                }
                                            );
                                            await new Promise(r => setTimeout(r, 1000));

                                            if (subTaskProjectIssue) {
                                                // Does it make sence?
                                                let users: string[] = [];
                                                for (const issueOwner of Object.keys(generatedIssues.userLog[vicePresidentEmail].projects[prj].users)) {
                                                    if (issueOwner != generatedIssues.userLog[vicePresidentEmail].projects[prj].project_owner_email) {
                                                        users.push(issueOwner);
                                                    }
                                                }
                                                if (users.length > 0) {
                                                    for (const issueOwnerEmail of Object.keys(generatedIssues.userLog[vicePresidentEmail].projects[prj].users)) {

                                                        let assign_user_gid: string | null = null;

                                                        if(asanaUsers.byMail[issueOwnerEmail]) {
                                                            assign_user_gid = asanaUsers.byMail[issueOwnerEmail].gid;
                                                        } else if(assign_project_gid) {
                                                            assign_user_gid = assign_project_gid;
                                                        }

                                                        await this.createTaskForIssuesOwner(
                                                            {
                                                                owner_name: generatedIssues.userLog[vicePresidentEmail].projects[prj].users[issueOwnerEmail].name,
                                                                owner_email: issueOwnerEmail,
                                                                project_name: prj,
                                                                assign_gid: assign_user_gid,
                                                                week_number: content.week_number,
                                                                deadline: content.deadline,
                                                                created_as_string: content.created.format("dddd, MMMM Do, YYYY"),
                                                                deadline_as_string: content.deadline.format("dddd, MMMM Do, YYYY"),
                                                                number_of_issues: "" + generatedIssues.userLog[vicePresidentEmail].projects[prj].users[issueOwnerEmail].issues_number,
                                                                worksheet_link: worksheet_link,
                                                                parent_ticket_id: subTaskProjectIssue.data.gid,
                                                                week_ticket_id: asana_ticket.data.gid,
                                                                userIssues: generatedIssues.userLog[vicePresidentEmail].projects[prj].users[issueOwnerEmail]
                                                            }
                                                        ).then(async (subTaskIssueInProjectIssue) => {
                                                            await new Promise(r => setTimeout(r, 500));
                                                            return null;
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                            } else {
                                console.log("       no collected issues for this VP ");
                            }
                        } else {
                            console.log("        VP is not responsible for This Project now ");
                        }


        }

            resolve();
        });
    }


    // -- Create Task ------------------------------------------------------------------------------------------------------

    private async createWeekReportTask(content: {
        week_number: number,
        deadline: Moment,
        worksheet_link: string
    }): Promise<AsanaTicketResult | null> {
        console.log("CreateAsanaTasks: createWeekReportTask:Due on:", moment().week(content.week_number).subtract(1, "day").add(7, 'day').format("YYYY-MM-DD"));
        return this.configApp.asanaService.tasks.createTask({
            name: "Week " + content.week_number + " -  General Report",
            projects: [kindlyReminder_asana_project_id],
            assignee: "1204853356727858",
            due_on: content.deadline.format("YYYY-MM-DD"),
            assignee_section: kindlyReminder_asana_project_section_id,
            html_notes: replaceKeys(
                new AsanaIssueContent().week_text
                , {
                    ...content,
                    ...{
                        project_id: kindlyReminder_asana_project_id,
                    }
                }
            ),
            custom_fields: {
                "1207797503212149": "1207797503212150",  // Type: [Weekly Report]
                "1207809299072702": content.week_number // Week Number
            }
        });
    }

    private async createTaskForVP(content: CreateTaskForVP): Promise<AsanaTicketResult | null> {
        const task = await this.configApp.asanaService.tasks.createSubTask( content.parent_ticket_id, {
            name: "Week " + content.week_number + " - " + content.owner_name + " - Opened issues(" + content.number_of_issues + ")",
            assignee: content.assign_gid,
            due_on:  content.deadline.format("YYYY-MM-DD"),
            html_notes: replaceKeys(new AsanaIssueContent().vp_text, {
                    ...content, ...{
                        project_id: kindlyReminder_asana_project_id,
                        list_of_issues: this.getListOfIssues(content.vPs_issues),
                    }
                }
            ),
            custom_fields: {
                "1207797503212149": "1207797503212150",  // Type: [Weekly Report]
                "1207809299072702": content.week_number // Week Number
            }
        });
        if (task?.data) {
            await this.removeFollowers(task.data.gid);
            return task;
        } else {
            return null;
        }
    }

    private async createTaskForProjectOwner(content: CreateTaskForProjectOwner): Promise<AsanaTicketResult | null> {
        const ticket = await this.configApp.asanaService.tasks.createSubTask( content.parent_ticket_id, {
            name: "Week " + content.week_number + " -"
                + " Project: [" + content.project_name + "]"
                +   (content.project_is_active == false ? " is DEACTIVATED!," : "")
                + " owner: " +content.owner_name
                + " - Opened Issues: "   + content.number_of_issues,
            due_on:  content.deadline.format("YYYY-MM-DD"),
            assignee: content.assign_gid,
            html_notes: replaceKeys(new AsanaIssueContent().project_text, {...content, ...{
                    project_id: kindlyReminder_asana_project_id,
                    list_of_issues: this.getListOfIssues(content.projectIssues.issues),
                }})
        });
        if (ticket) {
            await this.removeFollowers(ticket.data.gid);
            return ticket;
        } else {
            return null;
        }
    }

    private async createTaskForIssuesOwner(content: CreateTaskForIssuesOwner): Promise<AsanaTicketResult | null> {
        const ticket = await this.configApp.asanaService.tasks.createSubTask( content.parent_ticket_id, {
            name: "Week " + content.week_number + " - Non compliance issues in [" + content.project_name + "]"
                + " owner: " + content.owner_name
                + " - Opened Issues: "   + content.number_of_issues,
            due_on:  content.deadline.format("YYYY-MM-DD"),
            assignee: content.assign_gid ? content.assign_gid : null,
            html_notes: replaceKeys(
                new AsanaIssueContent().issues_owners_text,
                {
                    ...content,
                    ...{
                        project_id: kindlyReminder_asana_project_id,
                        list_of_issues: this.getListOfIssues(content.userIssues.issues),
                    }
                }
            )
        });
        if (ticket) {
            await this.removeFollowers(ticket.data.gid);
            return ticket;
        } else {
            return null;
        }
    }

    // -- Helpers ------------------------------------------------------------------------------------------------------

    private removeFollowers(taskId: string): Promise<void>  {
        return new Promise((resolve, reject): void => {
            this.configApp.asanaService.users.removeFollowers(taskId, kindlyReminder_asana_fallowers_to_remove)
                .then(() => {
                    resolve();
                })
        });
    }

    private getListOfIssues(issues: GetListOfIssues): string {
        let list_of_issues: string = "";

        for (const scriptName of Object.keys(issues)) {
            list_of_issues = list_of_issues + "<strong>What is Required to Fix:</strong> " + issues[scriptName].howToFixThat;
            list_of_issues = list_of_issues + "\n<ul>"
            for (const issue of issues[scriptName].issue) {
                list_of_issues = list_of_issues + '<li>Issue: <a href="https://groupondev.atlassian.net/browse/' + issue.ticketKey + '">' + issue.ticketKey + '</a> - '
                    +  (issue.fixedStatus == "TODO" ? 'Required by KR' : 'Recommended, will be mandatory (probably next week)')
                    +  '</li>'
            }
            list_of_issues = list_of_issues + "</ul>\n\n"
        }

        return list_of_issues;

    }
}

