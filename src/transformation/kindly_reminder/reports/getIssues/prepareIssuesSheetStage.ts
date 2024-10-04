import {GoogleSpreadsheetWorksheet} from "google-spreadsheet";
import {UpdateWeekConditionIntoWeekOverview} from "../dashboard/updateWeekTotalReport";
import {ActiveWorkSheetIssue, WeekWorkSheet} from "./_models";
import {kindlyReminder_spreadSheetId, KindlyReminderConfigApp} from "../../encore.service";
import {IssueAllInHunterGenerator} from "../issueAllInHunterGenerator";

/**
 * Najde ID worksheetu podle aktuálního týdne.
 * Pokud aktuální worksheet pro týden algoritmus nenajde
 *  - vytvoříme kopii z minulého týde
 *  - přejmenujeme tab
 *  - a smažeme obsah dokumentu (takže worksheet bude prázdný)
 */
export class IssueStage {

    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();
    protected static weekSheetCopy: ActiveWorkSheetIssue | null = null;

    // -- Constructor  -------------------------------------------------------------------------------------------------
    constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------
    public getActiveOrCreateActiveIssueWorkSheet(activeWeekNumber: number): Promise<ActiveWorkSheetIssue> {
        console.log("IssueStage:getActiveOrCreateActiveIssueWorkSheet: init ============================================");
        if (IssueStage.weekSheetCopy != null) {
            return new Promise((resolve, reject) => {
                if (IssueStage.weekSheetCopy != null) { // Again check for Eslint in Promise
                    return resolve(
                        IssueStage.weekSheetCopy
                    );
                } else {
                    reject("Missing IssueStage.weekSheetCopy"); // Never Happend - Issue on Eslint
                }
            });
        } else {
            return new Promise(async (resolve, reject) => {

                const sheet = await this.configApp.googleServices.spreadsheet.getSpreadsheet(kindlyReminder_spreadSheetId);
                let activeWeek: WeekWorkSheet | null = null;
                let activeWorkSheet: GoogleSpreadsheetWorksheet | null = null;

                let prevWeek: WeekWorkSheet | null = null;
                let prevWorkSheet: GoogleSpreadsheetWorksheet | null = null

                let clean: boolean = false;

                for (const workSheet of sheet.sheetsByIndex) {
                    // console.log("Sheet Name: ",  workSheet.a1SheetName );

                    if (workSheet.a1SheetName == "'Week " + activeWeekNumber + "'") {
                        activeWorkSheet = workSheet;
                        activeWeek = {
                            workSheetId: workSheet.sheetId,
                        };
                    }

                    if (workSheet.a1SheetName == "'Week " + (activeWeekNumber - 1) + "'") {
                        prevWorkSheet = workSheet;
                        prevWeek = {
                            workSheetId: workSheet.sheetId,
                        }
                    }
                }

                if (prevWorkSheet == null) {
                    console.log("Error - prevWorkSheet for week:", activeWeekNumber - 1, "not exist");
                    return reject("prevWorkSheet not exist");
                }

                if (activeWeek == null && prevWeek) {
                    clean = true;
                    activeWorkSheet = await prevWorkSheet.duplicate({
                        index: 3,
                        title: "Week " + activeWeekNumber
                    });
                    console.log("getActiveIssueWorkSheet: create new week");
                    await new UpdateWeekConditionIntoWeekOverview()
                        .updateWeekWithNewWorksheet(activeWeekNumber).then((result) => {
                        });
                }

                if (activeWorkSheet == null) {
                    console.log("Error - Active WorkSheet for week:", activeWeekNumber, "not exist");
                    return reject("Active WorkSheet for week");
                }

                console.log("getActiveIssueWorkSheet: return success");
                await activeWorkSheet.loadHeaderRow(2)
                const rows = await activeWorkSheet.getRows({offset: 0}); // can pass in { limit, offset }

                if (clean) {
                    console.log("getActiveIssueWorkSheet: clear rows");
                    await activeWorkSheet.clearRows({start: 3}); // clear
                } else {
                    console.log("getActiveIssueWorkSheet: clear rows is not required");
                }

                await activeWorkSheet.loadCells('A1:AZ10000'); // loads range of cells into local cache - DOES NOT RETURN THE CELLS
                let latestInderOfRow: number = 2;
                console.log("getActiveIssueWorkSheet: try to get LatestInderOfRow: rows", rows.length);


                console.log("getActiveIssueWorkSheet: loadCells");


                for (const row of rows) {
                    try {
                        const checkContentCell = activeWorkSheet.getCellByA1('A' + row.rowNumber); // access cells using a zero-based index
                        if (checkContentCell && checkContentCell.stringValue) {
                            //
                        } else {
                            break;
                        }
                    } catch (error) {
                        console.log("getActiveIssueWorkSheet: latest row before issue, ", row.rowNumber);
                        break;
                    }
                }

                IssueStage.weekSheetCopy = {
                    doc: sheet,
                    activeWeekNumber: activeWeekNumber,
                    sheet: activeWorkSheet,
                    rows: rows,
                    latestIndexOfRow: latestInderOfRow + 1
                };

                return resolve(
                    IssueStage.weekSheetCopy
                );


            });


        }
    }
}