import { AsanaIssueContentModel } from "./asanaIssueContent.model";
import { AsanaTicket } from "../../../../../libs/3partyApis/asana/models/asana_resultsModels";
import { kindlyReminder_asana_project_id, KindlyReminderConfigApp } from "../../encore.service";

export class CloseAsanaTicketsFromLastWeek {
  // -- Private Values -----------------------------------------------------------------------------------------------
  private readonly configApp = new KindlyReminderConfigApp();

  // - Constructor ---------------------------------------------------------------------------------------------------
  // constructor() {}

  // -- Public methods  ----------------------------------------------------------------------------------------------
  public async closeWeek(weekToClose: number): Promise<void> {
    console.log("CloseAsanaTicketsFromLastWeek:closeWeek: init =====================================================");

    const result = await this.configApp.asanaService.tasks.getAllTasks({
      project: kindlyReminder_asana_project_id,
    });

    if (!result || !result.data) {
      console.log("CloseAsanaTicketsFromLastWeek:closeWeek: Week ", weekToClose, "nothing founded or error");
      throw new Error("CloseAsanaTicketsFromLastWeek:closeWeek:Error getAllTasks error - no data");
    }

    let foundedTicket: AsanaTicket | null = null;

    for (const ticket of result.data) {
      console.log("CloseAsanaTicketsFromLastWeek:closeWeek: Week ", weekToClose, "found successfully: ticket", ticket.name);
      if (ticket.name == "Week " + weekToClose + " -  General Report") {
        foundedTicket = ticket;
      }
    }

    if (foundedTicket) {
      console.log("Week ", weekToClose, "found successfully!. Time to close all unresolved issues");
      await this.closeSubtask(foundedTicket, "");
    } else {
      console.log("CloseAsanaTicketsFromLastWeek:closeWeek: Week ", weekToClose, " required Week not found!");
    }
  }

  public async closeSubtask(task: AsanaTicket, space: string): Promise<void> {
    const result = await this.configApp.asanaService.tasks.getAllSubTasks(task.gid);

    if (!result || !result.data) {
      throw new Error("Error getAllSubTasks");
    }

    for (const subtask of result.data) {
      console.log("CloseAsanaTicketsFromLastWeek:closeSubtask", space, "Ticket:", subtask.name, "status", subtask.completed);
      if (!subtask.completed) {
        await this.configApp.asanaService.comments.createComment(subtask.gid, {
          html_text: new AsanaIssueContentModel().kindly_reminder_close_message,
        });

        console.log("CloseAsanaTicketsFromLastWeek:closeSubtask", space, space, "Ticket:", subtask.name, "comment created");
        await this.configApp.asanaService.tasks.updateTask(subtask.gid, { completed: true });
        console.log("CloseAsanaTicketsFromLastWeek:closeSubtask", space, space, "Subtask Ticket:", subtask.name, "ticket closed");
      } else {
        console.log("CloseAsanaTicketsFromLastWeek:closeSubtask", space, space, "Subtask Ticket is already completed");
      }
      await this.closeSubtask(subtask, space + "   ");
    }
  }
}
