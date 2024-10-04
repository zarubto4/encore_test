import {GoogleSpreadsheetWorksheet} from "google-spreadsheet";
import {IssueStage} from "./prepareIssuesSheetStage";
import {
    ActiveIssueWorkSheetWithIssues,
    IssueWorkSheet,
    WeekIssueWorkSheetCellIndexes
} from "./_models";
import {kindlyReminder_spreadSheetId, KindlyReminderConfigApp} from "../../encore.service";

export class GetPrintedIssuesList {

    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();
    protected static weekSheetCopy :{
        [weekNumber: string]: ActiveIssueWorkSheetWithIssues
    } = {};

    // -- Constructor  -------------------------------------------------------------------------------------------------
    constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------
    public updateIssueWorksheetHeader(activeWeek: number): Promise<GoogleSpreadsheetWorksheet> {
        return new Promise((resolve, reject): void => {
            this.getIssueWorksheet(activeWeek).then((result) => {
                console.log("ActiveIssueWorkSheetWithIssues:updateIssueWorksheetHeader: getIssueWorksheet done");
                this.configApp.googleServices.spreadsheet
                    .getSpreadsheetWithWorksheet(kindlyReminder_spreadSheetId, result.sheet.sheetId)
                    .then(async (spreadSheet) => {
                        console.log("ActiveIssueWorkSheetWithIssues:updateIssueWorksheetHeader: getSpreadsheetWithWorksheet done");
                        await spreadSheet.sheet.loadCells('A1:AZ30000');
                        await spreadSheet.sheet.loadHeaderRow(2);
                        console.log("ActiveIssueWorkSheetWithIssues:updateIssueWorksheetHeader: loadCells done");
                        await spreadSheet.sheet.getRows({offset: 0});
                        console.log("ActiveIssueWorkSheetWithIssues:updateIssueWorksheetHeader: getRows done");
                        resolve(spreadSheet.sheet);
                });

            });
        });
    }

    public getIssueWorksheet(activeWeek: number): Promise<ActiveIssueWorkSheetWithIssues> {
        console.log("ActiveIssueWorkSheetWithIssues:getIssueWorksheet: init =========================================================================");
        console.log("ActiveIssueWorkSheetWithIssues:getIssueWorksheet: week", activeWeek);

        if (GetPrintedIssuesList.weekSheetCopy[activeWeek + '']) {
            return new Promise((resolve, reject): void => {
                resolve(
                    GetPrintedIssuesList.weekSheetCopy[activeWeek + '']
                );
            });
        } else {
            return new Promise((resolve, reject): void => {
                new IssueStage()
                .getActiveOrCreateActiveIssueWorkSheet(activeWeek)
                .then(async (result)  => {

                        const issueWorkSheet: IssueWorkSheet = {
                            cells: new WeekIssueWorkSheetCellIndexes(),
                            issueList: [],
                            latestIndexOfRow: new WeekIssueWorkSheetCellIndexes().latestIndexOfRow,
                        }

                        console.log("getIssueUserStatistics: loadCells");
                        await result.sheet.loadCells('A1:AZ30000');
                        const rows = await result.sheet.getRows({offset: 0});

                        for (const row of rows) {
                            issueWorkSheet.issueList.push({
                                fixedStatus: result.sheet.getCellByA1(issueWorkSheet.cells.cells.fixedStatusCell + row.rowNumber).stringValue ?? "",
                                projectKey: result.sheet.getCellByA1(issueWorkSheet.cells.cells.projectKeyCell + row.rowNumber).stringValue ?? "",
                                ticketKey: result.sheet.getCellByA1(issueWorkSheet.cells.cells.ticketKeyCell + row.rowNumber).stringValue ?? "",
                                ticketStatus: result.sheet.getCellByA1(issueWorkSheet.cells.cells.ticketStatusCell + row.rowNumber).stringValue ?? "",
                                ticketType: result.sheet.getCellByA1(issueWorkSheet.cells.cells.ticketTypeCell + row.rowNumber).stringValue ?? "",
                                vpOwnerName: result.sheet.getCellByA1(issueWorkSheet.cells.cells.ticketVPCell + row.rowNumber).stringValue ?? "",
                                projectOwnerName: result.sheet.getCellByA1(issueWorkSheet.cells.cells.projectOwnerCell + row.rowNumber).stringValue ?? "" ,
                                ticketOwnerName: result.sheet.getCellByA1(issueWorkSheet.cells.cells.ticketOwnerCell + row.rowNumber).stringValue ?? "" ,
                                responsibilityOwnerName: result.sheet.getCellByA1(issueWorkSheet.cells.cells.responsibilityOwnerCell + row.rowNumber).stringValue?? "",
                                howToFixIssue: result.sheet.getCellByA1(issueWorkSheet.cells.cells.howToFixIssueCell + row.rowNumber).stringValue ?? "",
                                tempoHours: result.sheet.getCellByA1(issueWorkSheet.cells.cells.tempoHoursCell + row.rowNumber).numberValue ?? 0,
                                scriptName: result.sheet.getCellByA1(issueWorkSheet.cells.cells.scriptNameCell + row.rowNumber).stringValue ?? "",

                                projectOwnerEmail: result.sheet.getCellByA1(issueWorkSheet.cells.cells.projectOwnerEmailCell + row.rowNumber).stringValue,
                                responsibilityOwnerEmail: result.sheet.getCellByA1(issueWorkSheet.cells.cells.responsibilityOwnerEmailCell + row.rowNumber).stringValue,
                                ticketOwnerEmail: result.sheet.getCellByA1(issueWorkSheet.cells.cells.ticketOwnerEmailCell + row.rowNumber).stringValue,
                                vpOwnerEmail: result.sheet.getCellByA1(issueWorkSheet.cells.cells.ticketVPEmailCell + row.rowNumber).stringValue,

                                rowNumber: row.rowNumber,
                            });
                            issueWorkSheet.latestIndexOfRow = row.rowNumber;
                        }


                         console.log("getIssueUserStatistics: number of issues: ", issueWorkSheet.issueList.length);

                        GetPrintedIssuesList.weekSheetCopy[activeWeek + ''] = {
                            ...result,
                            ...{
                                rows: rows,
                                issueWorkSheet: issueWorkSheet
                            }
                        };

                        resolve(GetPrintedIssuesList.weekSheetCopy[activeWeek + '']);
                    });
            });
        }
    }




}

