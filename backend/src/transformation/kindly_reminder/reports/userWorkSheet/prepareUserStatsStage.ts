import { GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { ActiveUserWorkSheet, WeekUserWorkSheet, WeekUserWorkSheetCellIndexes, WeekUserWorkSheetUserContent } from "./_models";
import { Stats } from "../issuesPrint/_models";
import { kindlyReminder_spreadSheetId, kindlyReminder_userWorkSheetId, KindlyReminderConfigApp } from "../../encore.service";
import log from "encore.dev/log";

export class UserStage {
  // -- Private Values -----------------------------------------------------------------------------------------------
  protected static weekSheetCopy: Record<string, ActiveUserWorkSheet> = {};
  private readonly configApp = new KindlyReminderConfigApp();

  // -- Constructor  -------------------------------------------------------------------------------------------------
  // constructor() {}

  // -- Public methods  -----------------------------------------------------------------------------------------------
  public async getActiveUserWorkSheet(activeWeek: number): Promise<ActiveUserWorkSheet> {
    log.info("ActiveUserWorkSheet:getActiveUserWorkSheet: init =========================================================================");

    if (UserStage.weekSheetCopy[activeWeek + ""]) {
      return UserStage.weekSheetCopy[activeWeek + ""];
    } else {
      const userWorkSheet: WeekUserWorkSheet = {
        activeWeekColumReportedIssues: null,
        activeWeekColumFixedIssues: null,
        cells: new WeekUserWorkSheetCellIndexes(),
        users: {},
        latestIndexOfRow: new WeekUserWorkSheetCellIndexes().firstUserRow,
      };

      log.trace("ActiveUserWorkSheet:getActiveUserWorkSheet: get user spreadsheet");
      const result = await this.configApp.googleServices.spreadsheet.getSpreadsheetWithWorksheet(kindlyReminder_spreadSheetId, kindlyReminder_userWorkSheetId);
      log.trace("ActiveUserWorkSheet:getActiveUserWorkSheet: get rows");
      const rows = await result.sheet.getRows();
      await result.sheet.loadCells("A1:BZ1500");

      log.trace("ActiveUserWorkSheet:getActiveUserWorkSheet: try to find first user line: weekInYearRow" + userWorkSheet.cells.weekInYearRow);

      for (let i = 5; i < result.sheet.columnCount; i++) {
        const cellWithStats = result.sheet.getCell(userWorkSheet.cells.weekInYearRow, i);
        if (cellWithStats.numberValue == activeWeek) {
          userWorkSheet.activeWeekColumReportedIssues = cellWithStats.a1Column;
          userWorkSheet.activeWeekColumFixedIssues = result.sheet.getCell(userWorkSheet.cells.weekInYearRow, i + 1).a1Column;

          break;
        }
      }

      if (!userWorkSheet.activeWeekColumReportedIssues) {
        if (!userWorkSheet.activeWeekColumReportedIssues) {
          throw Error("Missing active week colum in user Stats");
        }
      }

      for (const row of rows) {
        if (row.rowNumber < userWorkSheet.latestIndexOfRow) {
          continue;
        }

        const userEmailCell = result.sheet.getCellByA1(userWorkSheet.cells.userCells.userEmailColum + row.rowNumber).stringValue; // access cells using a zero-based index
        const userNameCell = result.sheet.getCellByA1(userWorkSheet.cells.userCells.nameUserColum + row.rowNumber).stringValue; // access cells using a zero-based index

        const managerEmailCell = result.sheet.getCellByA1(userWorkSheet.cells.managerCells.managerEmailColum + row.rowNumber).stringValue; // access cells using a zero-based index
        const managerNameCell = result.sheet.getCellByA1(userWorkSheet.cells.managerCells.managerNameColum + row.rowNumber).stringValue; // access cells using a zero-based index

        if (userEmailCell && userEmailCell) {
          userWorkSheet.users[userEmailCell] = {
            row: row.rowNumber,
            userName: userNameCell ? userNameCell : userEmailCell,
            manager:
              managerNameCell && managerNameCell
                ? {
                    managerEmail: managerEmailCell ? managerEmailCell : managerNameCell,
                    managerName: managerNameCell,
                  }
                : null,
          };

          userWorkSheet.latestIndexOfRow = row.rowNumber;
        } else if (userNameCell) {
          userWorkSheet.users[userNameCell] = {
            row: row.rowNumber,
            userName: userNameCell,
            manager:
              managerNameCell && managerNameCell
                ? {
                    managerEmail: managerEmailCell ? managerEmailCell : managerNameCell,
                    managerName: managerNameCell,
                  }
                : null,
          };

          userWorkSheet.latestIndexOfRow = row.rowNumber;
        } else {
          log.trace("ActiveUserWorkSheet:getActiveUserWorkSheet: row user not properly set in row:" + row.rowNumber);
        }
      }

      userWorkSheet.latestIndexOfRow++;

      UserStage.weekSheetCopy[activeWeek + ""] = {
        ...result,
        ...{
          rows: rows,
          userWorkSheet: userWorkSheet,
        },
      };

      return UserStage.weekSheetCopy[activeWeek + ""];
    }
  }

  public async addWeekStatisticUnderUser(email: string, stats: Stats, activeWeek: number): Promise<void> {
    const result = await this.getActiveUserWorkSheet(activeWeek);

    const userWorkSheet: WeekUserWorkSheet = result.userWorkSheet;
    const sheet: GoogleSpreadsheetWorksheet = result.sheet;

    if (userWorkSheet.activeWeekColumReportedIssues == null || userWorkSheet.activeWeekColumFixedIssues == null) {
      console.error("Missing activeWeekColumReportedIssues or activeWeekColumFixedIssues");
      return;
    }

    const activeWeekReportedIssuesCell = sheet.getCellByA1(userWorkSheet.activeWeekColumReportedIssues + userWorkSheet.users[email].row); // access cells using a zero-based index
    const activeWeekFixedIssuesCell = sheet.getCellByA1(userWorkSheet.activeWeekColumFixedIssues + userWorkSheet.users[email].row); // access cells using a zero-based index

    activeWeekReportedIssuesCell.value = stats.TODO + stats.RECOMMENDED + stats.DONE + stats.SKIP + stats["Cap Labour"];
    activeWeekFixedIssuesCell.value = stats.TODO;
  }

  public async addNewUser(userName: string, email: string, activeWeek: number): Promise<WeekUserWorkSheetUserContent> {
    const result = await this.getActiveUserWorkSheet(activeWeek);
    const userWorkSheet: WeekUserWorkSheet = result.userWorkSheet;
    const sheet: GoogleSpreadsheetWorksheet = result.sheet;

    log.trace("printUserStats: User " + userName + " is not in list - WE have to create that on line: " + userWorkSheet.latestIndexOfRow);
    log.trace("printUserStats: User " + userName + " emailColumn " + userWorkSheet.cells.userCells.userEmailColum + userWorkSheet.latestIndexOfRow);

    const userEmailCell = sheet.getCellByA1(userWorkSheet.cells.userCells.userEmailColum + userWorkSheet.latestIndexOfRow); // access cells using a zero-based index
    const userStatusCell = sheet.getCellByA1(userWorkSheet.cells.userCells.statusUserColum + userWorkSheet.latestIndexOfRow); // access cells using a zero-based index
    const userNameCell = sheet.getCellByA1(userWorkSheet.cells.userCells.nameUserColum + userWorkSheet.latestIndexOfRow); // access cells using a zero-based index

    userEmailCell.value = email;
    userNameCell.value = userName;
    userStatusCell.value = "active";

    UserStage.weekSheetCopy[activeWeek + ""].userWorkSheet.users[email] = {
      userName: userName,
      manager: null,
      row: userWorkSheet.latestIndexOfRow++,
    };

    return userWorkSheet.users[email];
  }
}
