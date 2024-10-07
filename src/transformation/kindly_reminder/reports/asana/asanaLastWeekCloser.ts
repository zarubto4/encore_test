import {AsanaIssueContent} from "./asanaIssueContent";
import {AsanaTicket} from "../../../../_libraries/3partyApis/asana/models/asana_resultsModels";
import {kindlyReminder_asana_project_id, KindlyReminderConfigApp} from "../../encore.service";


export class CloseAsanaTicketsFromLastWeek {

    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();

    // - Constructor ---------------------------------------------------------------------------------------------------
    // constructor() {}

    // -- Public methods  ----------------------------------------------------------------------------------------------
    public async closeWeek(weekToClose: number): Promise<void> {
        console.log("CloseAsanaTicketsFromLastWeek:closeWeek: init =====================================================");

        const result = await this.configApp.asanaService.tasks.getAllTasks({
            project: kindlyReminder_asana_project_id
        });

        if(!result || !result.data) {
            throw new Error("Error getAllTasks");
        }

        for (const ticket of result.data) {
            if (ticket.name == ("Week " + weekToClose + " -  General Report")) {
                console.log("Week ", weekToClose, "found successfully");
                await this.closeSubtask(ticket, "");
            }
        }


    }

    public async closeSubtask(task: AsanaTicket, space: string): Promise<void> {
        const result = await this.configApp.asanaService.tasks.getAllSubTasks(task.gid);


        if(!result || !result.data) {
            throw new Error("Error getAllSubTasks");
        }

        for (const subtask of result.data) {
            console.log(space + "Ticket:", subtask.name, "status", subtask.completed);
            if (!subtask.completed) {
                await this.configApp.asanaService.comments.createComment(subtask.gid, {
                    html_text: new AsanaIssueContent().kindly_reminder_close_message
                });

                console.log(space + space + "Ticket:", subtask.name, "comment created");
                await this.configApp.asanaService.tasks.updateTask(subtask.gid, {completed: true});
                console.log(space + space + "Subtask Ticket:", subtask.name, "ticket closed");

            }  else {
                console.log(space + space + "Subtask Ticket is already completed");
            }
            await this.closeSubtask(subtask, space + "   ");
        }


    }
}
