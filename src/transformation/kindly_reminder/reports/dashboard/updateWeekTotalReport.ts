import {
    kindlyReminder_dashboardWorkSheetId,
    kindlyReminder_spreadSheetId,
    KindlyReminderConfigApp
} from "../../encore.service";
import {replaceKeys} from "../../../../_libraries/core/parsing_and_formating/stringInject";
import {SpreadSheetWorkSheet} from "../../../../_libraries/3partyApis/googleDocs/models/config";

/**
 * Určeno pro nalazení tabulky na úvodník worksheet, kde máme přehled vyřešených a nevyřešených issues.
 */
export class UpdateWeekConditionIntoWeekOverview {

    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();

    private scriptStart = "programmatic::weeksOverviewStart";
    private scriptEnd = "programmatic::weeksOverviewEnd";

    private numberOfIssuesFormula = '=COUNTIF(\'Week {week_number}\'!A6:A2501, "TODO") '
        + '+ COUNTIF(\'Week {week_number}\'!A6:A2501, "RECOMMENDED") '
        + '+ COUNTIF(\'Week {week_number}\'!A6:A2501, "DONE") '
        + '+ COUNTIF(\'Week {week_number}\'!A6:A2501,"Cap Labour") '
        + '+ COUNTIF(\'Week {week_number}\'!A6:A2501,"REMOVED") '
        + '+ COUNTIF(\'Week {week_number}\'!A6:A2501, "SKIP") ';

    private tempoHoursOutOfBPFormula: string = '=SUM(\'Week {week_number}\'!N6:N2501)';
    private notFixedIssuesFormula: string    = '=COUNTIF(\'Week {week_number}\'!A6:A2501, "TODO")';
    private fixedRatioFormula: string        = '=1-G{row_number}/(E{row_number}/100)/100';

    // -- Constructor  -------------------------------------------------------------------------------------------------
    constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------
    public updateWeekWithNewWorksheet(weekNumber: number): Promise<void> {
        console.log("UpdateWeekConditionIntoWeekOverview:updateWeekWithNewWorksheet: init ==============================");
        return new Promise((resolve, reject): void => {
            this.configApp.googleServices.spreadsheet
                .getSpreadsheetWithWorksheet(kindlyReminder_spreadSheetId, kindlyReminder_dashboardWorkSheetId)
                .then(async (result) => {
                    this.findTableIndexes(result, weekNumber)
                        .then(async (indexes) => {

                            console.log("UpdateWeekConditionIntoWeekOverview:updateWeekWithNewWorksheet: result", JSON.stringify(indexes));
                            console.log("UpdateWeekConditionIntoWeekOverview:updateWeekWithNewWorksheet: week Row index", indexes.weekRowIndex);

                            const numberOfIssueCell = result.sheet.getCellByA1("E" + indexes.weekRowIndex);
                            const tempoHoursOutOfBPCell = result.sheet.getCellByA1("F" + indexes.weekRowIndex);
                            const notFixedIssuesCell = result.sheet.getCellByA1("G" + indexes.weekRowIndex);
                            const fixedRatioCell = result.sheet.getCellByA1("H" + indexes.weekRowIndex);

                            numberOfIssueCell.value = replaceKeys(this.numberOfIssuesFormula, {'week_number': '' + weekNumber})
                            tempoHoursOutOfBPCell.value = replaceKeys(this.tempoHoursOutOfBPFormula, {'week_number': '' + weekNumber})
                            notFixedIssuesCell.value = replaceKeys(this.notFixedIssuesFormula, {'week_number': '' + weekNumber})
                            fixedRatioCell.value = replaceKeys(this.fixedRatioFormula, {'row_number': '' + indexes.weekRowIndex})

                            await result.sheet.saveUpdatedCells();

                            resolve();
                        })


                });
        });
    }

    // --- Helpers -----------------------------------------------------------------------------------------------------
    private findTableIndexes(spreadSheet: SpreadSheetWorkSheet, weekNumber: number): Promise<{
        weekRowIndex: number | null
    }> {
        return new Promise(async (resolve, reject) => {
            console.log("UpdateWeekConditionIntoWeekOverview:findTableIndexes: loadCells");
            await spreadSheet.sheet.loadCells('A1:AZ30000'); // loads range of cells into local cache - DOES NOT RETURN THE CELLS
            const rows = await spreadSheet.sheet.getRows({offset: 0}); // can pass in { limit, offset }

            let indexForSearchConditionsStart: number = 0; // Where we're starting to get Script conditions
            let indexForSearchConditionsEnd: number = 0; // Where we're ending to get Script conditions

            for (const row of rows) {
                // this mark: "scriptStart" is in worksheet in white color as invisible flag for this script
                if (spreadSheet.sheet.getCellByA1("A" + row.rowNumber).stringValue == this.scriptStart) {
                    console.log("UpdateWeekConditionIntoWeekOverview:findTableIndexes: rulesForScriptStart row: " + (row.rowNumber + 2));
                    indexForSearchConditionsStart = row.rowNumber + 2;
                }

                // this mark: "scriptEnd" is in worksheet in white color as invisible flag for this script
                if (spreadSheet.sheet.getCellByA1("A" + row.rowNumber).stringValue == this.scriptEnd) {
                    console.log("UpdateWeekConditionIntoWeekOverview:findTableIndexes: rulesForScriptEnd row: " + row.rowNumber);
                    indexForSearchConditionsEnd = row.rowNumber;
                    break;
                }
            }

            // Find Right row by Week number in colum B
            for( let rowIndex: number = (indexForSearchConditionsStart + 2); rowIndex < indexForSearchConditionsEnd; rowIndex++ ) {
                if (weekNumber == spreadSheet.sheet.getCellByA1("B" + rowIndex).numberValue) {
                    return resolve (
                        {
                            weekRowIndex: rowIndex,
                        }
                    );
                }
            }

            // If not found - return null
            return  resolve (
                {
                    weekRowIndex: null,
                }
            );

        });
    }


}
