import {GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet} from "google-spreadsheet";


// - Manager stage -----------------------------------------------------------------------------------------------------

export interface ManagerStructure {
    workerName: string;
    workerUserName?: string;
    workerEmail?: string
    stillWorking?: boolean
    lastDayInJob?: string
    manager: ManagerStructure | null
    vicePresidentLevelManager: ManagerStructure | null
}


export interface ManagerUserWorkSheet {
    doc: GoogleSpreadsheet;
    sheet: GoogleSpreadsheetWorksheet;
    rows: GoogleSpreadsheetRow[];
    managerStructure: Record<string, ManagerStructure> // key: userName
}

// - User stage --------------------------------------------------------------------------------------------------------

export class WeekUserWorkSheetCellIndexes {
    userCells: {
        nameUserColum: string,
        statusUserColum: string,
        userEmailColum:string,
    } = {
        nameUserColum: 'A',
        statusUserColum: 'B',
        userEmailColum: 'C'
    };

    managerCells: {
        managerNameColum: string,
        managerEmailColum: string,
    } = {
        managerNameColum: 'E',
        managerEmailColum: 'D',
    }

    weekInYearRow = 4; // n-1
    firstUserRow = 9;
}

export interface WeekUserWorkSheetUserContent {
    userName: string;
    manager: {
        managerName: string,
        managerEmail: string,
    } | null;
    row: number;
}
export interface WeekUserWorkSheet {
    activeWeekColumReportedIssues: string | null;
    activeWeekColumFixedIssues: string | null;
    cells: WeekUserWorkSheetCellIndexes
    users: Record<string, WeekUserWorkSheetUserContent> //key: userEmail
    latestIndexOfRow: number;
}

export interface ActiveUserWorkSheet {
    doc: GoogleSpreadsheet;
    sheet: GoogleSpreadsheetWorksheet;
    rows: GoogleSpreadsheetRow[];
    userWorkSheet: WeekUserWorkSheet;
}


export interface FillUserWorkSheet {
    cells: WeekUserWorkSheetCellIndexes;
    users: Record<string, WeekUserWorkSheetUserContent>;
    latestIndexOfRow: number;
}
