import {DashboardsConfigs, SearchCondition} from "../dashboard/_models";
import {ProjectWorkSheet} from "../projectWorkSheet/_models";
import {ActiveUserWorkSheet} from "../userWorkSheet/_models";
import {
    GoogleSpreadsheet,
    GoogleSpreadsheetCell,
    GoogleSpreadsheetRow,
    GoogleSpreadsheetWorksheet
} from "google-spreadsheet";
import {ExtendedIssue} from "../../../../_libraries/3partyApis/jira/models/jira_extededIssue";

export interface WriteIssuesWithAllConditionsContent {
    extendedTicket: ExtendedIssue;
    ourIssues: {
        [scriptName: string]: SearchCondition
    };
    tempoHours?: number;
    activeWorkSheetIssue: ActiveIssueWorkSheetWithIssues;
    projectWorkSheet: ProjectWorkSheet;
    userWorkSheet: ActiveUserWorkSheet;
    dashboardConfig: DashboardsConfigs;
}

export interface WriteIssuesContent {
    ourIssue: SearchCondition;
    extendedTicket: ExtendedIssue;
    tempoHours?: number;
    activeWorkSheetIssue: ActiveIssueWorkSheetWithIssues;
    projectWorkSheet: ProjectWorkSheet;
    userWorkSheet: ActiveUserWorkSheet;
    dashboardConfig: DashboardsConfigs;
}

export interface ResponsibilityOwnerShipAssigment {
    ourIssue: SearchCondition;
    extendedTicket: ExtendedIssue;
    responsibleOwner: {
        nameCell: GoogleSpreadsheetCell,
        emailCell: GoogleSpreadsheetCell
    };
    projectOwner: {
        nameString: string,
        emailString: string
    };
    vpOwner: {
        nameString: string,
        emailString: string
    };
    priorityCopyOwnerShip?: string[];
    userWorkSheet: ActiveUserWorkSheet
}


export class WeekIssueWorkSheetCellIndexes {
    cells: {
        fixedStatusCell: string,
        projectKeyCell: string,
        ticketKeyCell: string,
        ticketStatusCell: string,
        ticketTypeCell: string,
        ticketVPCell: string,
        projectOwnerCell: string,
        ticketOwnerCell: string,
        responsibilityOwnerCell: string,
        howToFixIssueCell: string,
        tempoHoursCell: string,
        issueReportedCell: string,
        issueLatestUpdateCell: string,
        missingInTempoFormulaCell: string,
        scriptNameCell: string,

        projectOwnerEmailCell: string;
        responsibilityOwnerEmailCell: string,
        ticketOwnerEmailCell: string;
        ticketVPEmailCell: string;
    } = {
        fixedStatusCell: 'A',
        projectKeyCell: 'B',
        ticketKeyCell: 'C',
        ticketStatusCell: 'D',
        ticketTypeCell: 'E',
        ticketVPCell: 'F',
        projectOwnerCell: 'G',
        ticketOwnerCell: 'H',
        responsibilityOwnerCell: 'I',
        howToFixIssueCell: 'J',
        tempoHoursCell: 'K',
        issueReportedCell: 'L',
        issueLatestUpdateCell: 'M',
        missingInTempoFormulaCell: 'N',
        scriptNameCell: 'O',

        projectOwnerEmailCell: 'Q',
        responsibilityOwnerEmailCell: 'S',
        ticketOwnerEmailCell: 'R',
        ticketVPEmailCell: 'P',
    }

    latestIndexOfRow: number = 3;
}


export interface IssueLog {
    fixedStatus: string;
    projectKey: string;
    ticketKey: string;
    ticketStatus: string;
    ticketType: string;

    vpOwnerName: string; // Name
    projectOwnerName: string;  // Name
    ticketOwnerName: string; // Name
    responsibilityOwnerName: string;  // Name

    howToFixIssue: string;
    tempoHours: number;
    scriptName: string;
    rowNumber: number;

    projectOwnerEmail?: string;
    responsibilityOwnerEmail?: string;
    ticketOwnerEmail?: string;
    vpOwnerEmail?: string;
}

export interface ActiveIssueWorkSheetWithIssues extends ActiveWorkSheetIssue {
    issueWorkSheet: IssueWorkSheet;
}

export interface WeekWorkSheet {
    workSheetId: number;
}

export interface IssueWorkSheet {
    cells: WeekIssueWorkSheetCellIndexes;
    issueList: IssueLog[];
    latestIndexOfRow: number;
}


export interface ActiveWorkSheetIssue {
    doc: GoogleSpreadsheet;
    activeWeekNumber: number;
    sheet: GoogleSpreadsheetWorksheet;
    rows: GoogleSpreadsheetRow[];
    latestIndexOfRow: number
}

export class IssueUSerLog {
    [vpUserEmail: string]: {
        issues: {
            [scriptName: string]: {
                howToFixThat: string
                issue: IssueLog[]
            }
        },
        projects: {
            [projectKey: string]: {
                issues: {
                    [scriptName: string]: {
                        howToFixThat: string
                        issue: IssueLog[]
                    }
                },
                users: {
                    [issueOwnerEmail: string]: {
                        name: string,
                        issues: {
                            [scriptName: string]: {
                                howToFixThat: string
                                issue: IssueLog[]
                            }
                        },
                        issues_number: number
                    },
                },
                project_owner_email?: string // Email
                project_owner_name?: string // Email
                issues_number: number
            }
        }
        issues_number: number,
        vpName: string,
    }

}

export interface UserVPStatistics extends ActiveIssueWorkSheetWithIssues {
    userLog: IssueUSerLog;
}
