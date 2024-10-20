import { GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from "google-spreadsheet";

export interface AuthenticationForGoogle {
  privateKey: string;
  clientEmail: string;
}

export interface SpreadSheetWorkSheet {
  doc: GoogleSpreadsheet;
  sheet: GoogleSpreadsheetWorksheet;
}
export interface SpreadSheetWorkSheetWithRows {
  doc: GoogleSpreadsheet;
  sheet: GoogleSpreadsheetWorksheet;
  rows: GoogleSpreadsheetRow[];
}
