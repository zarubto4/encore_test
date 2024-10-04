import {UserStage} from "../userWorkSheet/prepareUserStatsStage";
import {ProjectStage} from "../projectWorkSheet/prepareProjectStatsStage.service";
import {GetPrintedIssuesList} from "../getIssues/getPrintedIssues";
import {IssueUserStructure, Stats} from "./_models";
import {ManagerUserWorkSheet} from "../userWorkSheet/_models";
import {KindlyReminderConfigApp} from "../../encore.service";
import {ActiveWorkSheetIssue} from "../getIssues/_models";



export class Print {


    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();
    protected static weekSheetCopy: ActiveWorkSheetIssue | null = null;

    // -- Constructor  -------------------------------------------------------------------------------------------------
    constructor(protected managerWorkSheet?: ManagerUserWorkSheet) {}

    // -- Public methods  -----------------------------------------------------------------------------------------------

    // Print Issues into Spreadsheet -------------------------------
    public async printUserStats(activeWeek: number): Promise<void> {
        return new Promise((resolve, reject): void => {
            new UserStage().getActiveUserWorkSheet(activeWeek).then((activeUserWorkSheet) => {
                new GetPrintedIssuesList().getIssueWorksheet(activeWeek).then(async (activeIssueWorkSheet) => {

                    const logFromActiveWeek: IssueUserStructure = {}
                    await activeUserWorkSheet.sheet.saveUpdatedCells();

                    resolve();
                });
            });
        });
    }

    public async printProjectStats(activeWeek: number): Promise<void> {
        return new Promise((resolve, reject): void => {
            new ProjectStage().loadProjects(activeWeek).then((activeProjectWorkSheet) => {
                new GetPrintedIssuesList().getIssueWorksheet(activeWeek).then(async (activeIssueWorkSheet) => {

                    console.log("Print:printProjectStats:tickets total:", activeIssueWorkSheet.issueWorkSheet.issueList.length)

                    const logFromActiveWeek: {
                        [projectKey: string]: Stats
                    } = {};

                    for (const issue of activeIssueWorkSheet.issueWorkSheet.issueList) {
                        if (!logFromActiveWeek[issue.projectKey]) {
                            logFromActiveWeek[issue.projectKey] = new Stats();
                        }

                        switch (issue.fixedStatus) {
                            case "Cap Labour":
                            case "SKIP":
                            case "DONE":
                            case "RECOMMENDED":
                            case "TODO": {
                                logFromActiveWeek[issue.projectKey][issue.fixedStatus] = logFromActiveWeek[issue.projectKey][issue.fixedStatus] + 1;
                            }
                        }
                    }

                    for (const projectKey of Object.keys(logFromActiveWeek)) {
                        await new ProjectStage()
                            .addWeekStatisticUnderProject(
                                projectKey,
                                logFromActiveWeek[projectKey],
                                activeWeek
                            ).then((result) => {
                                console.log("Print:printUserStats: user added to list");
                            });
                    }

                    await activeProjectWorkSheet.sheet.saveUpdatedCells();
                    resolve();
                });
            });
        });
    }


}


