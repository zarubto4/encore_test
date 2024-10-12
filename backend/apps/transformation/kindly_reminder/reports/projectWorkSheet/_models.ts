import {GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet} from "google-spreadsheet";

export class WeekProjectWorkSheetCell {
    cell: {
        activeColum: string;
        projectKeyColum: string;
        projectOwnerNameColum: string;
        projectOwnerEmailColum: string;

        projectOwnerLeaderEmailColum: string;

        projectOwnerLeaderNameColum: string;
    } = {
        activeColum: 'A',
        projectKeyColum: 'B',
        projectOwnerNameColum: 'C',
        projectOwnerEmailColum: 'D',
        projectOwnerLeaderEmailColum: 'E',
        projectOwnerLeaderNameColum: 'F',
    }
    firstProjectRow = 9;
    weekInYearRow = 4; // n-1
}

export interface WeekProjectWorkSheet {
    activeWeekColumReportedIssues: string;
    activeWeekColumFixedIssues: string;
    activeColum: string;
    project: Projects;
    latestIndexOfRow: number;
}

export type Projects = Record<string, {
        row: number,
        allow: boolean,
        projectOwnerName: string | null
        projectOwnerEmail: string | null
        projectOwnerManagerName: string | null
        projectOwnerManagerEmail: string | null
    }>;

export interface FindRightWeekColumRequest {
    projectCells: WeekProjectWorkSheetCell;
    latestIndexOfRow: number;
}

export interface FindRightWeekColum {
    activeWeekColumReportedIssues: string;
    activeWeekColumFixedIssues: string;
}

export interface ProjectLog {
    owner_name: string;
    owner_email: string;
    vp_manager_name: string;
    vp_manager_email: string;
}

export interface ProjectsOverview {
    byOwnerEmail: Record<string, Record<string, ProjectLog>>// key: ownerEmail, key2: projectKey
    byVicePresidentEmail: Record<string, Record<string, ProjectLog>> // key: ownerEmail, key2: projectKey
    byProject: Record<string, ProjectLog>

}

export interface AddProjectToMap {
    projectLog: ProjectsOverview,
    project: string,
    owner: {
        ownerUserName: string,
        ownerUserEmail: string,
    },
    manager: {
        vpManagerName: string
        vpManagerEmail: string
    }
}

export interface ProjectWorkSheet {
    doc: GoogleSpreadsheet;
    sheet: GoogleSpreadsheetWorksheet;
    rows: GoogleSpreadsheetRow[];
    allowedProjects: string[];
    projectWorkSheet: WeekProjectWorkSheet;
    projectOwnerShipOverview: ProjectsOverview
}

