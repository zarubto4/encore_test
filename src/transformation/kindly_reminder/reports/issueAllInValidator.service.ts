
import moment from "moment/moment.js";

import {ActiveIssueWorkSheetWithIssues} from "./getIssues/_models";
import {GetPrintedIssuesList} from "./getIssues/getPrintedIssues";
import {KindlyReminderConfigApp} from "../encore.service";
import {Print} from "./issuesPrint/printIntWorkSheets";
import {JiraIssueValidator} from "./issueValidation/issueAllInValidator";
import {TransformationKindlyReminderValidatorRequest} from "../api_models/controller_models";
import {
    IssueFilterResponse,
    IssueListForValidation,
    IssueListForValidationScriptContent
} from "./issueValidation/_models";


export class JiraBugWeekHunterChecker {

    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();
    private readonly testProjectConditions: string[] = []; // <--- Change this if you want to apply script only for selected projects

    // -- Constructor  -------------------------------------------------------------------------------------------------
    // constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------
    public async runScript(script: TransformationKindlyReminderValidatorRequest): Promise<void> {
        console.log("JiraBugWeekHunterChecker:runScript: value:", script.value);
        await this.validate((script.value as number));

    }

    public async validate(activeWeekNumber: number): Promise < void > {

        console.log("JiraBugWeekHunterChecker:validate: call getActiveUserWorkSheet")

        // const userWorkSheet = await new UserStage().getActiveUserWorkSheet(activeWeekNumber);
        // const projectsWorkSheet = await new ProjectStage().loadProjects(activeWeekNumber);
        const activeIssueWeekNumber = await new GetPrintedIssuesList().getIssueWorksheet(activeWeekNumber);
        const filteredContent = this.filter(activeIssueWeekNumber); // Get filtered Content
        const issues = await this.configApp.jiraServices.issue.getAllIssues({jql: filteredContent.jql})

        console.log("Number of results: ", issues.length);

        // This is for case, when someone move ticket into another project (and jira return different ticket (key), then we ask
        for (const issue of issues) {

            let key: string | null = null
            // So we have to try to iterate new Ticket and try to find Legacy Key to continue

            if (!filteredContent.listOfIssuesWithScripts[issue.key]) {
                const changeLogResult =  await this.configApp.jiraServices.issue.getIssuesChangeLogs({issueIdOrKey: issue.key})
                for (const changelog of changeLogResult) {
                    if (changelog.items) {
                        for (const log of changelog.items) {
                            if (log.field == "Key") {
                                if (log.toString == issue.key) {
                                    console.log("Solving issue with replaced Ticket number: ", issue.key, "from", log.fromString);
                                    if(log.fromString ) {
                                        key = log.fromString;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (filteredContent.listOfIssuesWithScripts[issue.key] || key != null) {

                let keyString: Record<string, IssueListForValidationScriptContent> | null = null;
                if (filteredContent.listOfIssuesWithScripts[issue.key]) {
                    keyString = filteredContent.listOfIssuesWithScripts[issue.key]
                } else if(key != null) {
                    keyString = filteredContent.listOfIssuesWithScripts[key];
                }

                if (keyString) {
                    for (const script of Object.keys(keyString)) {
                        console.log("Solving issue:", issue.key, "script", script);
                        const responseValidation = await new JiraIssueValidator().validations(script, issue);

                        let cellInder: number | null = null;
                        if(filteredContent.listOfIssuesWithScripts[issue.key]) {
                            cellInder = filteredContent.listOfIssuesWithScripts[issue.key][script].row
                        } else if(key != null) {
                            cellInder = filteredContent.listOfIssuesWithScripts[key][script].row;
                        }

                        if (cellInder) {
                            const statusCell = activeIssueWeekNumber.sheet.getCellByA1('A' + cellInder);
                            if (responseValidation == 'DONE') {
                                statusCell.value = responseValidation;
                            }
                        }
                    }
                }
            }
        }


        console.log("JiraBugWeekHunterChecker:validate: call update");
        await activeIssueWeekNumber.sheet.saveUpdatedCells();

        await new GetPrintedIssuesList().updateIssueWorksheetHeader(activeWeekNumber).then(async (spreadSheet) => {
            spreadSheet.getCellByA1("C1").value = moment().format('YYYY-MM-DD HH:mm') + " CET";
            spreadSheet.getCellByA1("H1").value = moment().add(5, "minutes").format('HH:mm:ss') + " CET";
            spreadSheet.saveUpdatedCells();
        });

        await new Print().printProjectStats(activeWeekNumber);
        await new Print().printUserStats(activeWeekNumber);
    }

    private filter(activeIssueWeekNumber: ActiveIssueWorkSheetWithIssues): IssueFilterResponse {

        const listOfIssues: string[] = [];
        const listOfIssuesWithScripts: IssueListForValidation = {};
        for (const issue of activeIssueWeekNumber.issueWorkSheet.issueList) {
            if (issue.fixedStatus == "TODO" || issue.fixedStatus  == "RECOMMENDED" ) {
                if (this.testProjectConditions.length > 0 && !this.testProjectConditions.includes(issue.projectKey)) {
                    continue;
                }

                if (!listOfIssues.includes(issue.ticketKey)) {
                    listOfIssues.push(issue.ticketKey);
                }
                if (!listOfIssuesWithScripts[issue.ticketKey]) {
                    listOfIssuesWithScripts[issue.ticketKey] = {}
                }
                console.log("check ticket: ", issue.ticketKey, 'issue:', issue.scriptName);
                listOfIssuesWithScripts[issue.ticketKey][issue.scriptName] = {
                    row: issue.rowNumber,
                    fixStatus: issue.fixedStatus
                };
            }
        }

        let jql = "issueKey in ("
        for( let i = 0; i < listOfIssues.length; i++ ) {
            if((i + 1) < listOfIssues.length ) {
                jql = jql + listOfIssues[i] + ","
            } else {
                jql = jql + listOfIssues[i] + ")"
            }
        }

        return {
            listOfIssues: listOfIssues,
            listOfIssuesWithScripts: listOfIssuesWithScripts,
            jql: jql
        }

    }

}
