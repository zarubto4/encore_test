import {GoogleSpreadsheet, GoogleSpreadsheetWorksheet} from "google-spreadsheet";



export interface AuthenticationForGoogle {
    privateKey: string;
    clientEmail: string;
}

export interface SpreadSheetWorkSheet {
    doc: GoogleSpreadsheet;
    sheet: GoogleSpreadsheetWorksheet
}
