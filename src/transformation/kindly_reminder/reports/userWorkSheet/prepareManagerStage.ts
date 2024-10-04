import {GoogleSpreadsheetRow} from "google-spreadsheet";
import {ManagerStructure, ManagerUserWorkSheet} from "./_models";
import {
    kindlyReminder_managersWorkSheetId,
    kindlyReminder_spreadSheetId,
    KindlyReminderConfigApp
} from "../../encore.service";
import {ActiveWorkSheetIssue} from "../getIssues/_models";


export class Groupon_VPS {
    public vps: string[] = [
        "c_vrysanek@groupon.com", // "Vojtech Rysanek",      // CTO
        "dredmond@groupon.com",   // "Darren Redmond",       // VP Engineering
        "nranjanray@groupon.com", // "Nikash RanjanRay",     // VP Engineering
        "c_jlongauer@groupon.com", // "Juraj Longauer",      // VP Engineering
        "c_tsikola@groupon.com",  // "Tomas Sikola",         //  VP Transformation
        "c_drybar@groupon.com",   // "David Rybar",          // Director IT
        "c_mjerabek@groupon.com", // "Michal Jerabek",       // CPO
        // "Barbara Weisz",       // CSO
        // "Jiri Ponrt",          // CFO
        "c_zvydrova@groupon.com", // "Zuzana Vydrova",       // FF Director
       "alindsey@groupon.com",    // "Adam Lindsey",         // GO Director
       "c_zlinc@groupon.com",     // "Zdenek Linc",          // CMO
    ]
}

export class ManagerStage {

    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();
    public vps: string[] = new Groupon_VPS().vps;
    protected static sheetCopy: ManagerUserWorkSheet;

    // -- Constructor  -------------------------------------------------------------------------------------------------
    constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------
    public getManagers(): Promise<ManagerUserWorkSheet> {
        console.log("getManagers: init =========================================================================");
        if (ManagerStage.sheetCopy) {
            return new Promise((resolve, reject): void => {
                resolve(
                    ManagerStage.sheetCopy
                );
            });
        } else {
            return new Promise((resolve): void => {
                const managerStructure: { [userName: string]: ManagerStructure } = {};
                this.configApp.googleServices.spreadsheet.getSpreadsheetWithWorksheet(kindlyReminder_spreadSheetId, kindlyReminder_managersWorkSheetId)
                    .then(async (result) => {
                        console.log("getManagers: get Worksheet done");
                        const rows = await result.sheet.getRows();
                        await result.sheet.loadCells('A1:BD12');
                        console.log("getManagers: get Rows done");
                        return {...result, ...{rows: rows}};
                    })
                    .then(async (result) => {
                        return result.sheet.loadHeaderRow(1).then(() => {
                            console.log("getManagers: get Headers done");
                            return result;
                        });
                    })
                    .then(async (result) => {

                        console.log("getManagers: Users overview ------------------------------");
                        for (const row of result.rows) {

                            const workerNameCell = row.get("Worker Object");
                            const workerEmailCell = row.get("Email - Primary Work");
                            const workerUserNameCell = row.get("User Name");
                            const activeStatusCell = row.get("Active Status");
                            const lastDayCell = row.get("Last Day Of Work");
                            let workerName: string = workerNameCell.replace(' [C]', '').replace(' (On Leave)', '');

                            if (activeStatusCell != "Yes") {
                                continue;
                            }

                            console.log("getManagers: user:", workerName);
                            if (!managerStructure[workerName]) {
                                managerStructure[workerName] = {
                                    workerName: workerName,
                                    workerUserName: workerUserNameCell,
                                    workerEmail: workerEmailCell,
                                    stillWorking: (activeStatusCell != null && activeStatusCell == "YES"),
                                    lastDayInJob: lastDayCell,
                                    manager: null,
                                    vicePresidentLevelManager: null
                                }
                            } else if (managerStructure[workerName]) {
                                console.log("                 : user already Exist in schema");
                                if (managerStructure[workerName].lastDayInJob == null && lastDayCell) {
                                    console.log("                 : user already Exist and this position ended. Manager is probably obsolete");
                                } else if (managerStructure[workerName].lastDayInJob != null && lastDayCell) {
                                    console.log("                 : user already Exist and this position is still open. So manager must be overrided");
                                }
                            }

                            if (managerStructure[workerName] && !managerStructure[workerName].workerEmail) {
                                console.log("                 : user already Exist in schema - Setting emails");
                                managerStructure[workerName].workerEmail = workerEmailCell;
                                managerStructure[workerName].workerUserName = workerUserNameCell;
                            }

                            // Get Direct Manager
                            this.getDirectManager(row, managerStructure[workerName], managerStructure);

                            // Find VP level Manager
                            this.getVPLevelManager(row, managerStructure[workerName], managerStructure);
                        }

                        ManagerStage.sheetCopy = {...result, ...{managerStructure: managerStructure}}

                        resolve(ManagerStage.sheetCopy);
                    });
            });
        }
    }

    private getDirectManager(row: GoogleSpreadsheetRow, user: ManagerStructure, managerStructure: { [userName: string]: ManagerStructure }) {

        // Find Direct Manager
        for (let i: number = 10; i > 1; i-- ) {
            let str = "Management Chain - Level ";
            if (i == 10) {
                str = str + i
            } else {
                str = str + "0" + i
            }
            const manager10Cell = row.get(str).replace(' [C]','').replace(' (On Leave)', '');
            if (manager10Cell) {
                if (!managerStructure[manager10Cell]) {
                    managerStructure[manager10Cell] = {
                        workerName: manager10Cell,
                        manager: null,
                        vicePresidentLevelManager: null
                    }
                }
                user.manager = managerStructure[manager10Cell];
                break;
            }
        }
    }

    private getVPLevelManager(row: GoogleSpreadsheetRow, user: ManagerStructure, managerStructure: { [userName: string]: ManagerStructure }) {

        // User is VP itself
        if (this.vps.includes(user.workerName)) {
            user.vicePresidentLevelManager = user;
            return;
        }

        for (let i: number = 10; i > 1; i-- ) {
            let str = "Management Chain - Level ";
            if (i == 10) {
                str = str + i
            } else {
                str = str + "0" + i
            }

            const manager10Cell: string = row.get(str).replace(' [C]','').replace(' (On Leave)', '');
            if (manager10Cell) {
                if (this.vps.includes(manager10Cell)) {
                    if (!managerStructure[manager10Cell]) {
                        managerStructure[manager10Cell] = {
                            workerName: manager10Cell,
                            manager: null,
                            vicePresidentLevelManager: null
                        }
                    }
                    user.vicePresidentLevelManager = managerStructure[manager10Cell];
                    break;
                }
            }
        }
    }

}
