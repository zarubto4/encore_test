import { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { AddProjectToMap, FindRightWeekColum, Projects, ProjectsOverview, ProjectWorkSheet, WeekProjectWorkSheet, WeekProjectWorkSheetCell } from "./_models";
import { Stats } from "../issuesPrint/_models";
import { kindlyReminder_projectWorkSheetId, kindlyReminder_spreadSheetId, KindlyReminderConfigApp } from "../../encore.service";
import { SpreadSheetWorkSheet } from "../../../../../libs/3partyApis/googleDocs/models/config";

export class ProjectStage {
  // -- Private Values -----------------------------------------------------------------------------------------------
  private readonly configApp = new KindlyReminderConfigApp();
  protected static weekSheetCopy: Record<string, ProjectWorkSheet> = {};

  // -- Constructor  -------------------------------------------------------------------------------------------------
  //constructor() {}

  // -- Public methods  -----------------------------------------------------------------------------------------------
  public async loadProjects(activeWeek: number): Promise<ProjectWorkSheet> {
    console.log("ProjectStage:prepareProjects: init =========================================================================");

    if (ProjectStage.weekSheetCopy[activeWeek + ""] != null) {
      return ProjectStage.weekSheetCopy[activeWeek + ""];
    } else {
      const result = await this.configApp.googleServices.spreadsheet.getSpreadsheetWithWorksheet(kindlyReminder_spreadSheetId, kindlyReminder_projectWorkSheetId);
      const rows = await result.sheet.getRows();
      await result.sheet.loadCells("A1:BZ30000");

      const find = this.findRightWeekColum(result, activeWeek);

      if (!find) {
        throw Error("Missing active week colum in project Stats");
      }

      const projects = this.getProjectsFromSheet(rows, result);

      ProjectStage.weekSheetCopy[activeWeek + ""] = {
        ...result,
        rows: rows,
        projectWorkSheet: {
          project: projects.projects,
          activeWeekColumReportedIssues: find.activeWeekColumReportedIssues,
          activeWeekColumFixedIssues: find.activeWeekColumFixedIssues,
          activeColum: find.activeWeekColumReportedIssues,
          latestIndexOfRow: projects.latestActiveRow,
        },
        projectOwnerShipOverview: this.createProjectMap(rows, result),
        allowedProjects: this.filterOnlyActiveProjects(projects.projects),
      };

      // Return
      return ProjectStage.weekSheetCopy[activeWeek + ""];
    }
  }

  public async addWeekStatisticUnderProject(projectKey: string, stats: Stats, activeWeek: number): Promise<void> {
    const result = await this.loadProjects(activeWeek);

    const userWorkSheet: WeekProjectWorkSheet = result.projectWorkSheet;
    const sheet: GoogleSpreadsheetWorksheet = result.sheet;

    if (userWorkSheet.activeWeekColumReportedIssues == null || userWorkSheet.activeWeekColumFixedIssues == null) {
      throw new Error("Missing active week colum in project Stats");
    }

    const activeWeekReportedIssuesCell = sheet.getCellByA1(userWorkSheet.activeWeekColumReportedIssues + userWorkSheet.project[projectKey].row); // access cells using a zero-based index
    const activeWeekFixedIssuesCell = sheet.getCellByA1(userWorkSheet.activeWeekColumFixedIssues + userWorkSheet.project[projectKey].row); // access cells using a zero-based index

    activeWeekReportedIssuesCell.value = stats.TODO + stats.RECOMMENDED + stats.DONE + stats.SKIP + stats["Cap Labour"];
    activeWeekFixedIssuesCell.value = stats.TODO;
  }

  // --- Helpers -----------------------------------------------------------------------------------------------------

  private createProjectMap(rows: GoogleSpreadsheetRow[], sheet: SpreadSheetWorkSheet): ProjectsOverview {
    const projectOwnerShipOverview: ProjectsOverview = {
      byOwnerEmail: {},
      byVicePresidentEmail: {},
      byProject: {},
    };

    for (const row of rows) {
      const project: string | undefined = sheet.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectKeyColum + row.rowNumber).stringValue;

      if (project == undefined) {
        continue;
      }

      this.addProjectToMap({
        projectLog: projectOwnerShipOverview,
        project: project,
        owner: {
          ownerUserName: sheet.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerNameColum + row.rowNumber).stringValue ?? "",
          ownerUserEmail: sheet.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerEmailColum + row.rowNumber).stringValue ?? "",
        },
        manager: {
          vpManagerName: sheet.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerLeaderNameColum + row.rowNumber).stringValue ?? "",
          vpManagerEmail: sheet.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerLeaderEmailColum + row.rowNumber).stringValue ?? "",
        },
      });
    }

    return projectOwnerShipOverview;
  }

  private filterOnlyActiveProjects(projects: Projects): string[] {
    const projectsKeys: string[] = [];
    for (const key of Object.keys(projects)) {
      const proj = projects[key];
      if (proj.allow) {
        projectsKeys.push(key);
      }
    }
    return projectsKeys;
  }

  private getProjectsFromSheet(rows: GoogleSpreadsheetRow[], sheet: SpreadSheetWorkSheet): { projects: Projects; latestActiveRow: number } {
    const projects: Projects = {};
    let latestActiveRow = 0;

    // Get all projects from table
    for (const row of rows) {
      const projectKey = sheet.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectKeyColum + row.rowNumber).stringValue;
      const projectActiveStatus = sheet.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.activeColum + row.rowNumber).stringValue;

      const ownerUserNameCell = sheet.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerNameColum + row.rowNumber).stringValue;
      const ownerEmailCell = sheet.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerEmailColum + row.rowNumber).stringValue;

      const vpNameCell = sheet.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerLeaderNameColum + row.rowNumber).stringValue;
      const vpEmailCell = sheet.sheet.getCellByA1(new WeekProjectWorkSheetCell().cell.projectOwnerLeaderEmailColum + row.rowNumber).stringValue;

      if (!projectKey || projectKey == "") {
        continue;
      }

      latestActiveRow = row.rowNumber + 1;

      console.log("Project line:", row.rowNumber, "projectKey", projectKey, "status", projectActiveStatus);

      projects[projectKey] = {
        row: row.rowNumber,
        allow: projectActiveStatus == "ACTIVE" || projectActiveStatus == "READ ONLY",
        projectOwnerName: ownerUserNameCell ?? "",
        projectOwnerEmail: ownerEmailCell ?? "",
        projectOwnerManagerName: vpNameCell ?? "",
        projectOwnerManagerEmail: vpEmailCell ?? "",
      };
    }

    return { projects: projects, latestActiveRow: latestActiveRow };
  }

  private findRightWeekColum(sheet: SpreadSheetWorkSheet, activeWeek: number): FindRightWeekColum | null {
    for (let i = 5; i < sheet.sheet.columnCount; i++) {
      const cellWithStats = sheet.sheet.getCell(new WeekProjectWorkSheetCell().weekInYearRow, i);
      console.log("cellWithStats:", cellWithStats.a1Column, "numberValue", cellWithStats.numberValue, "activeWeek", activeWeek);

      if (cellWithStats.value == activeWeek) {
        console.log(" ---- cellWithStats founded:", cellWithStats.a1Column, "numberValue:", cellWithStats.numberValue);
        return {
          activeWeekColumReportedIssues: cellWithStats.a1Column,
          activeWeekColumFixedIssues: sheet.sheet.getCell(new WeekProjectWorkSheetCell().weekInYearRow, i + 1).a1Column,
        };
      } else {
        // console.log("cellWithStats:", cellWithStats.a1Column, "numberValue", cellWithStats.numberValue, " Not Equal!!" );
      }
    }

    return null;
  }

  private addProjectToMap(addProject: AddProjectToMap): void {
    addProject.projectLog.byProject[addProject.project] = {
      owner_name: addProject.owner.ownerUserName,
      owner_email: addProject.owner.ownerUserEmail,
      vp_manager_name: addProject.manager.vpManagerName,
      vp_manager_email: addProject.manager.vpManagerEmail,
    };

    if (!addProject.projectLog.byOwnerEmail[addProject.owner.ownerUserEmail]) {
      addProject.projectLog.byOwnerEmail[addProject.owner.ownerUserEmail] = {};
    }

    addProject.projectLog.byOwnerEmail[addProject.owner.ownerUserEmail][addProject.project] = addProject.projectLog.byProject[addProject.project];

    if (!addProject.projectLog.byVicePresidentEmail[addProject.manager.vpManagerEmail]) {
      addProject.projectLog.byVicePresidentEmail[addProject.manager.vpManagerEmail] = {};
    }

    addProject.projectLog.byVicePresidentEmail[addProject.manager.vpManagerEmail][addProject.project] = addProject.projectLog.byProject[addProject.project];
  }
}
