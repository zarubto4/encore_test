import {UserStage} from "../userWorkSheet/prepareUserStatsStage";
import {ProjectStage} from "../projectWorkSheet/prepareProjectStatsStage.service";
import {GetPrintedIssuesList} from "../getIssues/getPrintedIssues";
import {Stats} from "./_models";

export class Print {

    // -- Private Values -----------------------------------------------------------------------------------------------

    // -- Constructor  -------------------------------------------------------------------------------------------------
    // constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------

    // Print Issues into Spreadsheet
    public async printUserStats(activeWeek: number): Promise<void> {
        const activeUserWorkSheet = await new UserStage().getActiveUserWorkSheet(activeWeek);
        await new GetPrintedIssuesList().getIssueWorksheet(activeWeek);
        await activeUserWorkSheet.sheet.saveUpdatedCells();
    }

    public async printProjectStats(activeWeek: number): Promise<void> {

        const activeProjectWorkSheet = await  new ProjectStage().loadProjects(activeWeek);
        const activeIssueWorkSheet = await new GetPrintedIssuesList().getIssueWorksheet(activeWeek);

        console.log("Print:printProjectStats:tickets total:", activeIssueWorkSheet.issueWorkSheet.issueList.length)

        const logFromActiveWeek: Record<string, Stats> = {}; // key: projectKey

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
                )
        }

        await activeProjectWorkSheet.sheet.saveUpdatedCells();
    }


}


