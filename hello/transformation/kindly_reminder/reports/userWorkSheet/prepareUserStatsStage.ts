import {GoogleSpreadsheetWorksheet} from "google-spreadsheet";
import {
    ActiveUserWorkSheet,
    WeekUserWorkSheet,
    WeekUserWorkSheetCellIndexes,
    WeekUserWorkSheetUserContent
} from "./_models";
import {Stats} from "../issuesPrint/_models";
import {
    kindlyReminder_spreadSheetId,
    kindlyReminder_userWorkSheetId,
    KindlyReminderConfigApp
} from "../../encore.service";


export class UserStage {

    // -- Private Values -----------------------------------------------------------------------------------------------
    protected static weekSheetCopy :{
        [weekNumber: string]: ActiveUserWorkSheet
    } = {};
    private readonly configApp = new KindlyReminderConfigApp();

    // -- Constructor  -------------------------------------------------------------------------------------------------
    constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------
    public getActiveUserWorkSheet(activeWeek: number): Promise<ActiveUserWorkSheet> {
        console.log("ActiveUserWorkSheet:getActiveUserWorkSheet: init =========================================================================");

        if (UserStage.weekSheetCopy[activeWeek + '']) {
            return new Promise((resolve, reject): void => {
                resolve(
                    UserStage.weekSheetCopy[activeWeek + '']
                );
            });
        } else {
            return new Promise((resolve, reject): void => {

                const userWorkSheet: WeekUserWorkSheet = {
                    activeWeekColumReportedIssues: null,
                    activeWeekColumFixedIssues: null,
                    cells: new WeekUserWorkSheetCellIndexes(),
                    users: {},
                    latestIndexOfRow: new WeekUserWorkSheetCellIndexes().firstUserRow,
                }

                console.log("ActiveUserWorkSheet:getActiveUserWorkSheet: get user spreadsheet");
                this.configApp.googleServices.spreadsheet.getSpreadsheetWithWorksheet(kindlyReminder_spreadSheetId, kindlyReminder_userWorkSheetId)
                    .then(async (result) => {
                        console.log("ActiveUserWorkSheet:getActiveUserWorkSheet: get rows");
                        const rows = await result.sheet.getRows();
                        await result.sheet.loadCells('A1:BZ1500');
                        return {
                            ... result,
                            rows: rows
                        };
                    })
                    .then((result) => {
                        console.log("ActiveUserWorkSheet:getActiveUserWorkSheet: try to find first user line: weekInYearRow", userWorkSheet.cells.weekInYearRow);

                        for (let i = 5; i <  result.sheet.columnCount; i++) {
                            const cellWithStats =  result.sheet.getCell(userWorkSheet.cells.weekInYearRow, i);
                            if (cellWithStats.numberValue == activeWeek) {
                                userWorkSheet.activeWeekColumReportedIssues = cellWithStats.a1Column;
                                userWorkSheet.activeWeekColumFixedIssues =  result.sheet.getCell(userWorkSheet.cells.weekInYearRow, i + 1).a1Column;

                                break;
                            }
                        }

                        if (!userWorkSheet.activeWeekColumReportedIssues) {
                            if (!userWorkSheet.activeWeekColumReportedIssues) {
                                reject("Missing active week colum in user Stats");
                                throw Error("Missing active week colum in user Stats");
                            }
                        } else {
                            return result;
                        }

                    })
                    .then(async (result) => {

                        console.log("ActiveUserWorkSheet:getActiveUserWorkSheet: going and scanning users into memory");

                        if (result == undefined) {
                            return;
                        }

                        for (const row of result.rows) {
                            if (row.rowNumber < userWorkSheet.latestIndexOfRow) {
                                continue;
                            }

                            const userEmailCell = result.sheet.getCellByA1( userWorkSheet.cells.userCells.userEmailColum +  row.rowNumber).stringValue; // access cells using a zero-based index
                            const userNameCell = result.sheet.getCellByA1( userWorkSheet.cells.userCells.nameUserColum +  row.rowNumber).stringValue; // access cells using a zero-based index

                            const managerEmailCell = result.sheet.getCellByA1( userWorkSheet.cells.managerCells.managerEmailColum +  row.rowNumber).stringValue; // access cells using a zero-based index
                            const managerNameCell = result.sheet.getCellByA1( userWorkSheet.cells.managerCells.managerNameColum +  row.rowNumber).stringValue; // access cells using a zero-based index

                            if (userEmailCell && userEmailCell) {
                                userWorkSheet.users[userEmailCell] = {
                                    row: row.rowNumber,
                                    userName: userNameCell ? userNameCell : userEmailCell,
                                    manager: (managerNameCell && managerNameCell) ? {
                                        managerEmail: managerEmailCell ? managerEmailCell : managerNameCell,
                                        managerName: managerNameCell,
                                    } : null
                                }

                                userWorkSheet.latestIndexOfRow  = row.rowNumber;

                            } else if (userEmailCell && userNameCell ) {
                                userWorkSheet.users[userNameCell] = {
                                    row: row.rowNumber,
                                    userName: userNameCell,
                                    manager: (managerNameCell && managerNameCell) ? {
                                        managerEmail: managerEmailCell ? managerEmailCell : managerNameCell,
                                        managerName: managerNameCell,
                                    } : null
                                }

                                userWorkSheet.latestIndexOfRow  = row.rowNumber;
                            }

                            else {
                                console.log("ActiveUserWorkSheet:getActiveUserWorkSheet: row user not properly set in row:", row.rowNumber);
                            }
                        }

                        userWorkSheet.latestIndexOfRow++;

                        UserStage.weekSheetCopy[activeWeek + ''] = {
                            ...result,
                            ...{
                                userWorkSheet: userWorkSheet
                            }
                        };

                        resolve(UserStage.weekSheetCopy[activeWeek + '']);
                    });

            });
        }
    }

    public addWeekStatisticUnderUser(email: string, stats: Stats, activeWeek: number): Promise<void> {
        return new Promise(async (resolve, reject) => {
            return this.getActiveUserWorkSheet(activeWeek).then((result) => {

                const userWorkSheet: WeekUserWorkSheet = result.userWorkSheet;
                const sheet: GoogleSpreadsheetWorksheet = result.sheet;

                if (userWorkSheet.activeWeekColumReportedIssues == null || userWorkSheet.activeWeekColumFixedIssues == null) {
                    return reject("Missing activeWeekColumReportedIssues or activeWeekColumFixedIssues");
                }

                const activeWeekReportedIssuesCell = sheet.getCellByA1(userWorkSheet.activeWeekColumReportedIssues + userWorkSheet.users[email].row); // access cells using a zero-based index
                const activeWeekFixedIssuesCell =  sheet.getCellByA1(userWorkSheet.activeWeekColumFixedIssues + userWorkSheet.users[email].row); // access cells using a zero-based index

                activeWeekReportedIssuesCell.value = stats.TODO + stats.RECOMMENDED + stats.DONE + stats.SKIP + stats["Cap Labour"];
                activeWeekFixedIssuesCell.value = stats.TODO;

                resolve();
            });
        });
    }

    public addNewUser(userName: string, email: string, activeWeek: number): Promise<WeekUserWorkSheetUserContent> {
        return new Promise( (resolve, reject) => {
            return this.getActiveUserWorkSheet(activeWeek).then(async (result) => {
                const userWorkSheet: WeekUserWorkSheet = result.userWorkSheet;
                const sheet: GoogleSpreadsheetWorksheet = result.sheet;

                console.log("printUserStats: User", userName, "is not in list - WE have to create that on line: ", userWorkSheet.latestIndexOfRow)
                console.log("printUserStats: User", userName, "emailColumn ", userWorkSheet.cells.userCells.userEmailColum +  userWorkSheet.latestIndexOfRow);

                const userEmailCell = sheet.getCellByA1( userWorkSheet.cells.userCells.userEmailColum +  userWorkSheet.latestIndexOfRow); // access cells using a zero-based index
                const userStatusCell = sheet.getCellByA1( userWorkSheet.cells.userCells.statusUserColum +  userWorkSheet.latestIndexOfRow); // access cells using a zero-based index
                const userNameCell = sheet.getCellByA1( userWorkSheet.cells.userCells.nameUserColum +  userWorkSheet.latestIndexOfRow); // access cells using a zero-based index

                userEmailCell.value = email;
                userNameCell.value = userName;
                userStatusCell.value = "active";

                UserStage.weekSheetCopy[activeWeek + ''].userWorkSheet.users[email] = {
                    userName: userName,
                    manager: null,
                    row: userWorkSheet.latestIndexOfRow++
                }

                resolve(
                    userWorkSheet.users[email]
                );
            });
        });
    }

}
