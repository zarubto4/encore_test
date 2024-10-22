import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { ManagerStructure, ManagerUserWorkSheet } from "./prepareManagerStage.models";
import {
  kindlyReminder_grouponVPs,
  kindlyReminder_managersWorkSheetId,
  kindlyReminder_spreadSheetId,
  KindlyReminderConfigApp,
} from "../../encore.service";
import log from "encore.dev/log";

export class ManagerStage {
  // -- Private Values -----------------------------------------------------------------------------------------------
  private readonly configApp = new KindlyReminderConfigApp();
  protected static sheetCopy: ManagerUserWorkSheet;

  // -- Constructor  -------------------------------------------------------------------------------------------------
  // constructor() {}

  // -- Public methods  -----------------------------------------------------------------------------------------------
  public async getManagers(): Promise<ManagerUserWorkSheet> {
    console.info("getManagers: init =========================================================================");
    if (ManagerStage.sheetCopy) {
      return ManagerStage.sheetCopy;
    } else {
      const managerStructure: Record<string, ManagerStructure> = {};
      const result = await this.configApp.googleServices.spreadsheet.getSpreadsheetWithWorksheet(
        kindlyReminder_spreadSheetId,
        kindlyReminder_managersWorkSheetId,
      );

      log.trace("getManagers: get Worksheet done");
      const rows = await result.sheet.getRows();
      await result.sheet.loadCells("A1:BD12");
      log.trace("getManagers: get Rows done");

      await result.sheet.loadHeaderRow(1);
      log.trace("getManagers: get Headers done");

      log.trace("getManagers: Users overview ------------------------------");
      for (const row of rows) {
        const workerNameCell = row.get("Worker Object");
        const workerEmailCell = row.get("Email - Primary Work");
        const workerUserNameCell = row.get("User Name");
        const activeStatusCell = row.get("Active Status");
        const lastDayCell = row.get("Last Day Of Work");
        const workerName: string = workerNameCell.replace(" [C]", "").replace(" (On Leave)", "");

        if (activeStatusCell != "Yes") {
          continue;
        }

        log.trace("getManagers: user:" + workerName);
        if (!managerStructure[workerName]) {
          managerStructure[workerName] = {
            workerName: workerName,
            workerUserName: workerUserNameCell,
            workerEmail: workerEmailCell,
            stillWorking: activeStatusCell != null && activeStatusCell == "YES",
            lastDayInJob: lastDayCell,
            manager: null,
            vicePresidentLevelManager: null,
          };
        } else if (managerStructure[workerName]) {
          log.trace("                 : user already Exist in schema");
          if (managerStructure[workerName].lastDayInJob == null && lastDayCell) {
            log.trace("                 : user already Exist and this position ended. Manager is probably obsolete");
          } else if (managerStructure[workerName].lastDayInJob != null && lastDayCell) {
            log.trace("                 : user already Exist and this position is still open. So manager must be override");
          }
        }

        if (managerStructure[workerName] && !managerStructure[workerName].workerEmail) {
          log.trace("                 : user already Exist in schema - Setting emails");
          managerStructure[workerName].workerEmail = workerEmailCell;
          managerStructure[workerName].workerUserName = workerUserNameCell;
        }

        // Get Direct Manager
        this.getDirectManager(row, managerStructure[workerName], managerStructure);

        // Find VP level Manager
        this.getVPLevelManager(row, managerStructure[workerName], managerStructure);
      }

      ManagerStage.sheetCopy = { ...result, ...{ rows: rows, managerStructure: managerStructure } };

      return ManagerStage.sheetCopy;
    }
  }

  private getDirectManager(row: GoogleSpreadsheetRow, user: ManagerStructure, managerStructure: Record<string, ManagerStructure>) {
    // Find Direct Manager
    for (let i = 10; i > 1; i--) {
      let str = "Management Chain - Level ";
      if (i == 10) {
        str = str + i;
      } else {
        str = str + "0" + i;
      }
      const manager10Cell = row.get(str).replace(" [C]", "").replace(" (On Leave)", "");
      if (manager10Cell) {
        if (!managerStructure[manager10Cell]) {
          managerStructure[manager10Cell] = {
            workerName: manager10Cell,
            manager: null,
            vicePresidentLevelManager: null,
          };
        }
        user.manager = managerStructure[manager10Cell];
        break;
      }
    }
  }

  private getVPLevelManager(row: GoogleSpreadsheetRow, user: ManagerStructure, managerStructure: Record<string, ManagerStructure>) {
    // User is VP itself
    if (kindlyReminder_grouponVPs.includes(user.workerName)) {
      user.vicePresidentLevelManager = user;
      return;
    }

    for (let i = 10; i > 1; i--) {
      let str = "Management Chain - Level ";
      if (i == 10) {
        str = str + i;
      } else {
        str = str + "0" + i;
      }

      const manager10Cell: string = row.get(str).replace(" [C]", "").replace(" (On Leave)", "");
      if (manager10Cell) {
        if (kindlyReminder_grouponVPs.includes(manager10Cell)) {
          if (!managerStructure[manager10Cell]) {
            managerStructure[manager10Cell] = {
              workerName: manager10Cell,
              manager: null,
              vicePresidentLevelManager: null,
            };
          }
          user.vicePresidentLevelManager = managerStructure[manager10Cell];
          break;
        }
      }
    }
  }
}
