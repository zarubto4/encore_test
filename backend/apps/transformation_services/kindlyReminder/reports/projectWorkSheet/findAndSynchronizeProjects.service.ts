import { ManagerStage } from "../userWorkSheet/prepareManagerStage";
import { Projects, WeekProjectWorkSheetCell } from "./_models";
import { kindlyReminder_hideThiesVps, kindlyReminder_hideThiesVpsConvertor, kindlyReminder_projectWorkSheetId, kindlyReminder_spreadSheetId, KindlyReminderConfigApp } from "../../encore.service";

export class FindAndSynchronizeProjects {
  // -- Private Values -----------------------------------------------------------------------------------------------
  private readonly configApp = new KindlyReminderConfigApp();

  // -- Constructor  -------------------------------------------------------------------------------------------------
  // constructor() {}

  // -- Public methods  -----------------------------------------------------------------------------------------------
  public async prepareProjects(): Promise<void> {
    console.log("ProjectStage:prepareProjects: init =========================================================================");

    const projects: Projects = {};
    const result = await this.configApp.googleServices.spreadsheet.getSpreadsheetWithWorksheet(kindlyReminder_spreadSheetId, kindlyReminder_projectWorkSheetId);
    const rows = await result.sheet.getRows();
    await result.sheet.loadCells("A1:BZ30000");
    const managerWorksheet = await new ManagerStage().getManagers();
    const allUsers = await this.configApp.jiraServices.user.getUsers({ maxResults: 1000 });
    const jiraProjects = await this.configApp.jiraServices.project.getAllProjects({ orderBy: "name", expand: ["lead"], status: ["live"] });
    let latestIndexOfRow: number = new WeekProjectWorkSheetCell().firstProjectRow;

    //
    for (const row of rows) {
      const projectKey: string | undefined = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectKeyColum + row.rowNumber).stringValue;

      if (!projectKey) {
        continue;
      }

      const projectActiveStatus: string | undefined = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.activeColum + row.rowNumber).stringValue;
      const ownerUserNameCell: string | undefined = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerNameColum + row.rowNumber).stringValue;
      const ownerEmailCell: string | undefined = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerEmailColum + row.rowNumber).stringValue;
      const vpNameCell: string | undefined = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerLeaderNameColum + row.rowNumber).stringValue;
      const vpEmailCell: string | undefined = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerLeaderEmailColum + row.rowNumber).stringValue;

      console.log("Project line:", row.rowNumber, "projectKey", projectKey, "status", projectActiveStatus);

      // Put project in map
      projects[projectKey] = {
        row: row.rowNumber,
        allow: projectActiveStatus == "ACTIVE" || projectActiveStatus == "READ ONLY",
        projectOwnerName: ownerUserNameCell ?? null,
        projectOwnerEmail: ownerEmailCell ?? null,
        projectOwnerManagerName: vpNameCell ?? null,
        projectOwnerManagerEmail: vpEmailCell ?? null,
      };

      latestIndexOfRow = row.rowNumber + 1;
    }

    // Set project as Archived if this project is no more in the active list
    for (const projectKey of Object.keys(projects)) {
      if (jiraProjects.find((p) => p.key == projectKey) == null) {
        console.log("Project not found in list of active projects - so we have to set that to archive");
        const projectActiveStatus = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.activeColum + projects[projectKey].row);
        projectActiveStatus.value = "ARCHIVED";
      }
    }

    // Synchronise missing Projects from JIRA
    for (const project of jiraProjects) {
      console.log("prepareProjects: Jira project:", project.key, "lead", project.lead.displayName);

      if (!projects[project.key]) {
        console.log("prepareProjects: Jira project:", project.key, " - this project is missing in complete overview. Last index", latestIndexOfRow);

        const projectKey = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectKeyColum + latestIndexOfRow);
        const projectActiveStatus = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.activeColum + latestIndexOfRow);

        const ownerUserNameCell = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerNameColum + latestIndexOfRow);
        const ownerEmailCell = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerEmailColum + latestIndexOfRow);
        const vpNameCell = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerLeaderNameColum + latestIndexOfRow);
        const vpEmailCell = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerLeaderEmailColum + latestIndexOfRow);

        projectKey.value = project.key;
        projectActiveStatus.value = "ACTIVE";

        if (project.name.includes("(Read") || project.name.includes("(read")) {
          projectActiveStatus.value = "READ ONLY";
        }

        console.log("prepareProjects: Jira project:", project.key, " - this project is missing in complete overview. Last index", latestIndexOfRow);
        console.log("                             : project.lead?: ", project.lead ? project.lead.displayName : "No lead");

        if (project.lead && project.lead.displayName == "Former user") {
          ownerUserNameCell.value = "Without owner";
          ownerEmailCell.value = "Without owner";
          vpNameCell.value = "No VP";
          vpEmailCell.value = "No VP";
        } else if (project.lead && !project.lead.active) {
          ownerUserNameCell.value = "Without owner";
          ownerEmailCell.value = "Without owner";
          vpNameCell.value = "No VP";
          vpEmailCell.value = "No VP";
        } else if (!project.lead) {
          ownerUserNameCell.value = "Without owner";
          ownerEmailCell.value = "Without owner";
          vpNameCell.value = "No VP";
          vpEmailCell.value = "No VP";
        } else {
          ownerUserNameCell.value = project.lead.displayName;
          ownerEmailCell.value = project.lead.emailAddress;
        }

        projects[project.key] = {
          row: latestIndexOfRow,
          allow: true,
          projectOwnerName: project.lead && project.lead.displayName ? project.lead.displayName : null,
          projectOwnerEmail: project.lead && project.lead.emailAddress ? project.lead.emailAddress : null,
          projectOwnerManagerName: null,
          projectOwnerManagerEmail: null,
        };

        latestIndexOfRow++;
      } else {
        const ownerUserNameCell = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerNameColum + projects[project.key].row);
        const ownerEmailCell = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerEmailColum + projects[project.key].row);
        const projectActiveStatus = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.activeColum + projects[project.key].row);

        // Update in every iteration
        if (project.lead && project.lead.displayName != "Former user" && project.lead.active) {
          ownerUserNameCell.value = project.lead.displayName;

          if (!project.lead.emailAddress) {
            console.log("User - missing email - load separately");
            await this.configApp.jiraServices.user.getUser({ accountId: project.lead.accountId }).then((user) => {
              if (user) {
                ownerEmailCell.value = user.emailAddress;
              }
            });
          }
        }

        if (project.name.includes("(Read") || project.name.includes("(read")) {
          projectActiveStatus.value = "READ ONLY";
        }

        if (managerWorksheet && project.lead.displayName && managerWorksheet.managerStructure[project.lead.displayName]) {
          const managerNameCell = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerLeaderNameColum + projects[project.key].row);
          const managerEmailCell = result.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerLeaderEmailColum + projects[project.key].row);

          if (managerNameCell.stringValue == "No VP" || !managerNameCell.stringValue) {
            if (managerWorksheet.managerStructure[project.lead.displayName].vicePresidentLevelManager) {
              const manager = managerWorksheet.managerStructure[project.lead.displayName].vicePresidentLevelManager;
              if (manager && kindlyReminder_hideThiesVps.includes(manager.workerName)) {
                if (kindlyReminder_hideThiesVpsConvertor[manager.workerName]) {
                  managerNameCell.value = kindlyReminder_hideThiesVpsConvertor[manager.workerName];
                }
              } else if (manager) {
                managerNameCell.value = manager.workerName;
                managerEmailCell.value = manager.workerEmail;
              }
            } else {
              managerNameCell.value = "No VP";
            }
          }

          // Synchronise VP emails
          else if (!managerEmailCell.stringValue && managerNameCell.stringValue != "No VP" && managerNameCell.stringValue) {
            console.log("Manager - missing email - try to find in all user map: Manager name:", managerNameCell.stringValue);
            const userFinder = allUsers.find((user) => user.displayName == managerNameCell.stringValue);
            if (userFinder) {
              console.log("Manager - missing email - load separately: What we found:", JSON.stringify(userFinder, null, 2));
              await this.configApp.jiraServices.user.getUser({ accountId: userFinder.accountId }).then((user) => {
                console.log("Manager - missing email - response from JIRA:", JSON.stringify(user, null, 2));
                if (user) {
                  managerEmailCell.value = user.emailAddress;
                }
              });
            }
          }
        }
      }
    }

    await result.sheet.saveUpdatedCells(); // save all updates in one call
  }

  /*
    public async fillZeroInNonIssuedProjects(config: ProjectWorkSheet): Promise<void>  {
        const rows = await config.sheet.getRows(); // can pass in { limit, offset }
        await config.sheet.loadCells('A1:BZ30000'); // loads range of cells into local cache - DOES NOT RETURN THE CELLS

        for (const row of rows) {

            const projectKeyCell = config.sheet.getCellByA1( new WeekProjectWorkSheetCell().cell.projectKeyColum + row.rowNumber).stringValue;
            let activeWeekStatsCell = config.sheet.getCellByA1(config.projectWorkSheet.activeWeekColumReportedIssues + row.rowNumber).numberValue;

            if (projectKeyCell) {
                if (!activeWeekStatsCell) {
                    activeWeekStatsCell = 0;
                }
            }
        }

        await config.sheet.saveUpdatedCells(); // save all updates in one call
    }*/
}
