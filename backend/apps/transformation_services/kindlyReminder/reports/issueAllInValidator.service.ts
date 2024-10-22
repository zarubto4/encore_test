import moment from "moment/moment.js";

import { ActiveIssueWorkSheetWithIssues } from "./getIssues/issues.models";
import { GetPrintedIssuesList } from "./getIssues/getPrintedIssues.service";
import { KindlyReminderConfigApp } from "../encore.service";
import { Print } from "./issuesPrint/issuePrint.service";
import { JiraIssueValidator } from "./issueValidation/issueValidation.service";
import { TransformationKindlyReminderValidatorRequest } from "../api_models/controllers.models";
import { IssueFilterResponse, IssueListForValidation, IssueListForValidationScriptContent } from "./issueValidation/issueValidation.models";
import log from "encore.dev/log";

export class JiraBugWeekHunterChecker {
  // -- Private Values -----------------------------------------------------------------------------------------------
  private readonly configApp = new KindlyReminderConfigApp();
  private readonly testProjectConditions: string[] = []; // <--- Change this if you want to apply script only for selected projects

  // -- Constructor  -------------------------------------------------------------------------------------------------
  // constructor() {}

  // -- Public methods  -----------------------------------------------------------------------------------------------
  public async runScript(script: TransformationKindlyReminderValidatorRequest): Promise<void> {
    log.trace("JiraBugWeekHunterChecker:runScript: value:" + script.value);
    await this.validate(script.value as number);
  }

  public async validate(activeWeekNumber: number): Promise<void> {
    log.trace("JiraBugWeekHunterChecker:validate: call getActiveUserWorkSheet: activeWeekNumber", activeWeekNumber);

    // const userWorkSheet = await new UserStage().getActiveUserWorkSheet(activeWeekNumber);
    // const projectsWorkSheet = await new ProjectStage().loadProjects(activeWeekNumber);
    const activeIssueWeekNumber = await new GetPrintedIssuesList().getIssueWorksheet(activeWeekNumber);

    log.debug("JiraBugWeekHunterChecker:validate: activeIssueWeekNumber done");
    const filteredContent = this.filter(activeIssueWeekNumber); // Get filtered Content

    log.debug("JiraBugWeekHunterChecker:validate: filteredContent done");
    const issues = await this.configApp.jiraServices.issue.getAllIssues({ jql: filteredContent.jql });

    log.debug("JiraBugWeekHunterChecker:validate: issues done");
    log.debug("Number of results: " + issues.length);

    // This is for case, when someone move ticket into another project (and jira return different ticket (key), then we ask
    for (const issue of issues) {
      let key: string | null = null;
      // So we have to try to iterate new Ticket and try to find Legacy Key to continue

      if (!filteredContent.listOfIssuesWithScripts[issue.key]) {
        const changeLogResult = await this.configApp.jiraServices.issue.getIssuesChangeLogs({ issueIdOrKey: issue.key });
        for (const changelog of changeLogResult) {
          if (changelog.items) {
            for (const logF of changelog.items) {
              if (logF.field == "Key") {
                if (logF.toString == issue.key) {
                  log.trace("Solving issue with replaced Ticket number: " + issue.key + " from " + logF.fromString);
                  if (logF.fromString) {
                    key = logF.fromString;
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
          keyString = filteredContent.listOfIssuesWithScripts[issue.key];
        } else if (key != null) {
          keyString = filteredContent.listOfIssuesWithScripts[key];
        }

        if (keyString) {
          for (const script of Object.keys(keyString)) {
            log.trace("Solving issue: " + issue.key + " script " + script);
            const responseValidation = await new JiraIssueValidator().validations(script, issue);

            let cellInder: number | null = null;
            if (filteredContent.listOfIssuesWithScripts[issue.key]) {
              cellInder = filteredContent.listOfIssuesWithScripts[issue.key][script].row;
            } else if (key != null) {
              cellInder = filteredContent.listOfIssuesWithScripts[key][script].row;
            }

            if (cellInder) {
              const statusCell = activeIssueWeekNumber.sheet.getCellByA1("A" + cellInder);
              if (responseValidation == "DONE") {
                statusCell.value = responseValidation;
              }
            }
          }
        }
      }
    }

    log.trace("JiraBugWeekHunterChecker:validate: call update");
    await activeIssueWeekNumber.sheet.saveUpdatedCells();

    const spreadSheet = await new GetPrintedIssuesList().updateIssueWorksheetHeader(activeWeekNumber);
    spreadSheet.getCellByA1("C1").value = moment().format("YYYY-MM-DD HH:mm") + " CET";
    spreadSheet.getCellByA1("H1").value = moment().add(5, "minutes").format("HH:mm:ss") + " CET";
    await spreadSheet.saveUpdatedCells();

    await new Print().printProjectStats(activeWeekNumber);
    await new Print().printUserStats(activeWeekNumber);
  }

  private filter(activeIssueWeekNumber: ActiveIssueWorkSheetWithIssues): IssueFilterResponse {
    const listOfIssues: string[] = [];
    const listOfIssuesWithScripts: IssueListForValidation = {};
    for (const issue of activeIssueWeekNumber.issueWorkSheet.issueList) {
      if (issue.fixedStatus == "TODO" || issue.fixedStatus == "RECOMMENDED") {
        if (this.testProjectConditions.length > 0 && !this.testProjectConditions.includes(issue.projectKey)) {
          continue;
        }

        if (!listOfIssues.includes(issue.ticketKey)) {
          listOfIssues.push(issue.ticketKey);
        }
        if (!listOfIssuesWithScripts[issue.ticketKey]) {
          listOfIssuesWithScripts[issue.ticketKey] = {};
        }
        log.trace("check ticket: " + issue.ticketKey + "issue:" + issue.scriptName);
        listOfIssuesWithScripts[issue.ticketKey][issue.scriptName] = {
          row: issue.rowNumber,
          fixStatus: issue.fixedStatus,
        };
      }
    }

    let jql = "issueKey in (";
    for (let i = 0; i < listOfIssues.length; i++) {
      if (i + 1 < listOfIssues.length) {
        jql = jql + listOfIssues[i] + ",";
      } else {
        jql = jql + listOfIssues[i] + ")";
      }
    }

    return {
      listOfIssues: listOfIssues,
      listOfIssuesWithScripts: listOfIssuesWithScripts,
      jql: jql,
    };
  }
}
