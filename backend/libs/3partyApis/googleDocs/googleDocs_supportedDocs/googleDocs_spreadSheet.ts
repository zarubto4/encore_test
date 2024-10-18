import { JWT } from "google-auth-library";
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { SpreadSheetWorkSheet } from "../models/config";
import log from "encore.dev/log";

export class GoogleSpreadSheetService {
  constructor(protected googleAccountAuth: JWT) {}

  public async getSpreadsheetWithWorksheet(fileId: string, workSheetId: number): Promise<SpreadSheetWorkSheet> {
    log.trace("SpreadSheet:getSpreadsheetWithWorksheet: try to call", { fileId: fileId, workSheetId: workSheetId });
    try {
      const sheet = await this.getSpreadsheet(fileId);
      log.trace("SpreadSheet:getSpreadsheetWithWorksheet:", { fileId: fileId, sheetTitle: sheet.title, workSheetId: workSheetId });
      return {
        doc: sheet,
        sheet: this.getWorkSheet(sheet, workSheetId),
      };
    } catch (error) {
      log.trace("SpreadSheet:getSpreadsheetWithWorksheet: error", error);
      throw new Error("Shit Happens");
    }
  }

  public async getSpreadsheetWithWorksheetLoadCellsAndGetRows(
    fileId: string,
    workSheetId: number,
    cellLoad: string,
    rows: { offset?: number; limit?: number },
  ): Promise<SpreadSheetWorkSheet> {
    log.trace("SpreadSheet:getSpreadsheetWithWorksheet: try to call", { fileId: fileId, workSheetId: workSheetId });
    try {
      const sheet = await this.getSpreadsheet(fileId);
      log.trace("SpreadSheet:getSpreadsheetWithWorksheet:", { fileId: fileId, sheetTitle: sheet.title, workSheetId: workSheetId });
      const worksheet = this.getWorkSheet(sheet, workSheetId);

      await worksheet.loadCells(cellLoad);
      await worksheet.getRows(rows);

      return {
        doc: sheet,
        sheet: worksheet,
      };
    } catch (error) {
      log.trace("SpreadSheet:getSpreadsheetWithWorksheet: error", error);
      throw new Error("Shit Happens");
    }
  }

  public async getSpreadsheet(id: string): Promise<GoogleSpreadsheet> {
    const doc = new GoogleSpreadsheet(id, this.googleAccountAuth);
    await doc.loadInfo();
    return doc;
  }

  public getWorkSheet(spreadSheet: GoogleSpreadsheet, workSheetId: number): GoogleSpreadsheetWorksheet {
    return spreadSheet.sheetsById[workSheetId];
  }
}
