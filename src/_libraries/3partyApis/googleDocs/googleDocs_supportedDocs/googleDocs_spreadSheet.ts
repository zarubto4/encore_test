import {JWT} from "google-auth-library";
import {GoogleSpreadsheet, GoogleSpreadsheetWorksheet} from "google-spreadsheet";
import {SpreadSheetWorkSheet} from "../models/config";


export class GoogleSpreadSheetService {

    constructor(protected googleAccountAuth: JWT) {}

    public async getSpreadsheetWithWorksheet(fileId: string, workSheetId: number): Promise<SpreadSheetWorkSheet> {
        console.log("SpreadSheet:getSpreadsheetWithWorksheet: try to call fileId", fileId, "workSheetId", workSheetId);
        try {
            const sheet =  await this.getSpreadsheet(fileId);
            console.log("SpreadSheet:getSpreadsheetWithWorksheet:", sheet.title, "workSheetId:", workSheetId);
            return(
                {
                    doc: sheet,
                    sheet: this.getWorkSheet(sheet, workSheetId)
                }
            );
        } catch (error) {
            console.log("SpreadSheet:getSpreadsheetWithWorksheet: error", error);
            throw new Error("Shit Happens");
        }

    }

    public async getSpreadsheet(id: string): Promise<GoogleSpreadsheet> {
        const doc = new GoogleSpreadsheet(id, this.googleAccountAuth);
        await doc.loadInfo();
        return doc;
    }

    public getWorkSheet(spreadSheet: GoogleSpreadsheet, workSheetId: number): GoogleSpreadsheetWorksheet{
        return spreadSheet.sheetsById[workSheetId];
    }


}
