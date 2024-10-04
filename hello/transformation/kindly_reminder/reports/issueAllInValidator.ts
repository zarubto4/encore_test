
import moment from "moment/moment.js";
import {TransformationKindlyReminderValidatorRequest} from "../hello_3";
import {UserStage} from "./userWorkSheet/prepareUserStatsStage";
import {ProjectStage} from "./projectWorkSheet/prepareProjectStatsStage";
import {ActiveIssueWorkSheetWithIssues, ActiveWorkSheetIssue} from "./getIssues/_models";
import {GetPrintedIssuesList} from "./getIssues/getPrintedIssues";
import {KindlyReminderConfigApp} from "../encore.service";
import {Print} from "./issuesPrint/printIntWorkSheets";
import {JiraIssueValidator} from "./issueValidation/issueAllInValidator";


export class IssueListForValidation {
    [issueId: string]: {
        [scriptName: string]: {
            row: number,
            fixStatus: string
        }
    }
}

export class JiraBugWeekHunterChecker {

    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();
    private readonly testProjectConditions: string[] = []; // <--- Change this if you want to apply script only for selected projects

    // -- Constructor  -------------------------------------------------------------------------------------------------
    constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------
    public runScript(script: TransformationKindlyReminderValidatorRequest): Promise<void> {
        console.log("IssueAllInHunterGenerator:runScript: name:", script.name);

        return new Promise(async (resolve, reject) => {

            switch (script.name) {
                case "valid_week": {
                    this.validate(<number>script.value)
                        .then((result) => {
                            console.log("Result - Request script done:", script.name);
                            resolve();
                        });
                    break;
                }
            }
        });
    }

    public validate(activeWeekNumber: number): Promise < void > {

       console.log("JiraBugWeekHunterChecker:validate: call getActiveUserWorkSheet")

       return new Promise((resolve, reject): void => {
           new UserStage().getActiveUserWorkSheet(activeWeekNumber).then((userWorkSheet) => {
               return new ProjectStage().loadProjects(activeWeekNumber).then((projectsWorkSheet) => {
                   return new GetPrintedIssuesList().getIssueWorksheet(activeWeekNumber).then(async (activeIssueWeekNumber) => {

                       // Get filtered Content
                       const filteredContent = this.filter(activeIssueWeekNumber);

                       await this.configApp.jiraServices.issue.getAllIssues({jql: filteredContent.jql})
                           .then(async (issues) => {
                               console.log("Number of results: ", issues.length);

                               // This is for case, when someone move ticket into another project (and jira return different ticket (key), then we ask
                               for (const issue of issues) {

                                   let key: string | null = null
                                   // So we have to try to iterate new Ticket and try to find Legacy Key to continue

                                   if (!filteredContent.listOfIssuesWithScripts[issue.key]) {
                                       await this.configApp.jiraServices.issue.getIssuesChangeLogs({issueIdOrKey: issue.key})
                                           .then((result) => {
                                               for (const changelog of result) {
                                                   if (changelog.items) {
                                                       for (const log of changelog.items) {
                                                           if (log.field == "Key") {
                                                               if (log.toString == issue.key) {
                                                                   console.log("Solving issue with replaced Ticket number: ", issue.key, "from", log.fromString);
                                                                   if(log.fromString ) {
                                                                       key = log.fromString;
                                                                       return key;
                                                                   }
                                                               }
                                                           }
                                                       }
                                                   }
                                               }
                                               return null;
                                           });
                                   }

                                   if (filteredContent.listOfIssuesWithScripts[issue.key] || key != null) {

                                       let keyString: {[key:string]: any} | null = null;
                                       if(filteredContent.listOfIssuesWithScripts[issue.key]) {
                                           keyString = filteredContent.listOfIssuesWithScripts[issue.key]
                                        }else if(key != null) {
                                           keyString = filteredContent.listOfIssuesWithScripts[key];
                                       }

                                       if (keyString) {
                                           for (const script of Object.keys(keyString)) {
                                               console.log("Solving issue:", issue.key, "script", script);
                                               await new JiraIssueValidator()
                                                   .validations(script, issue)
                                                   .then((responseValidation: string) => {

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
                                                   });
                                           }
                                       }

                                   }




                               }
                           });

                       console.log("JiraBugWeekHunterChecker:validate: call update");
                       await activeIssueWeekNumber.sheet.saveUpdatedCells();

                       await new GetPrintedIssuesList().updateIssueWorksheetHeader(activeWeekNumber).then(async (spreadSheet) => {
                           spreadSheet.getCellByA1("C1").value = moment().format('YYYY-MM-DD HH:mm') + " CET";
                           spreadSheet.getCellByA1("H1").value = moment().format('YYYY-MM-DD HH:mm') + " CET";
                           spreadSheet.saveUpdatedCells();
                       });


                       await new Print().printProjectStats(
                           activeWeekNumber
                       ).then((projectPrint) => {});

                       await new Print().printUserStats(
                           activeWeekNumber
                       ).then((userPrint) => {});


                       resolve();
                   });
               });
           });
       });

    }

    private filter(activeIssueWeekNumber: ActiveIssueWorkSheetWithIssues): {listOfIssues: string[], listOfIssuesWithScripts: IssueListForValidation, jql: string } {

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

        let jql: string = "issueKey in ("
        for( let i: number = 0; i < listOfIssues.length; i++ ) {
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
