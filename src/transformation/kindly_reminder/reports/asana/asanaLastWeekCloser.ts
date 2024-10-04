import {AsanaIssueContent} from "./asanaIssueContent";
import {AsanaTicket} from "../../../../_libraries/3partyApis/asana/models/asana_resultsModels";
import {kindlyReminder_asana_project_id, KindlyReminderConfigApp} from "../../encore.service";
import {ActiveWorkSheetIssue} from "../getIssues/_models";


export class CloseAsanaTicketsFromLastWeek {

    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();

    // - Constructor ---------------------------------------------------------------------------------------------------
    constructor() {}

    // -- Public methods  ----------------------------------------------------------------------------------------------
    public closeWeek(weekToClose: number): Promise<void> {
        console.log("CloseAsanaTicketsFromLastWeek:closeWeek: init =====================================================");
        return new Promise((resolve): void => {
            this.configApp.asanaService.tasks.getAllTasks({
                project: kindlyReminder_asana_project_id
            }).then(async (result) => {
                if (result) {
                    for (const ticket of result.data) {
                        if (ticket.name == ("Week " + weekToClose + " -  General Report")) {
                            console.log("Week ", weekToClose, "found successfully");
                            await this.closeSubtask(ticket, "");
                        }
                    }
                }
            });
        });
    }

    public closeSubtask(task: AsanaTicket, space: string): Promise<void> {
        return this.configApp.asanaService.tasks.getAllSubTasks(task.gid)
            .then(async (subtasks) => {
                if (subtasks) {
                    for (const subtask of subtasks.data) {
                        console.log(space + "Ticket:", subtask.name, "status", subtask.completed);
                        if (!subtask.completed) {
                            await this.configApp.asanaService.comments.createComment(subtask.gid, {
                                html_text: new AsanaIssueContent().kindly_reminder_close_message
                            }).then(async (createdComment) => {
                                console.log(space + space + "Ticket:", subtask.name, "comment created");
                                await this.configApp.asanaService.tasks.updateTask(subtask.gid, {completed: true}).then((completedStatus) => {
                                    console.log(space + space + "Subtask Ticket:", subtask.name, "ticket closed");
                                });
                                console.log(space + space + "Subtask Ticket:", subtask.name, "comment created");
                            });
                        }  else {
                            console.log(space + space + "Subtask Ticket is already completed");
                        }
                        await this.closeSubtask(subtask, space + "   ");
                    }
                }
            });
    }
}
