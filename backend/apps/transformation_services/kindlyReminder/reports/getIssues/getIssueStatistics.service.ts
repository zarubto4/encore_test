import { GetPrintedIssuesList } from "./getPrintedIssues.service";
import { IssueUSerLog, UserVPStatistics } from "./issues.models";

export class GetIssueUserStatistics {
  // -- Private Values -----------------------------------------------------------------------------------------------
  protected static weekSheetCopy: Record<string, UserVPStatistics> = {}; // key: weekNumber

  // -- Constructor  -------------------------------------------------------------------------------------------------
  // constructor() {}

  // -- Public methods  -----------------------------------------------------------------------------------------------
  public async getIssueUserStatistics(activeWeek: number): Promise<UserVPStatistics> {
    console.log("GetIssueUserStatistics:getIssueUserStatistics: init ===============================================");
    console.log("GetIssueUserStatistics:getIssueUserStatistics: week", activeWeek);

    if (GetIssueUserStatistics.weekSheetCopy[activeWeek + ""]) {
      console.log("GetIssueUserStatistics:getIssueUserStatistics: source is already loaded in memory");
      return GetIssueUserStatistics.weekSheetCopy[activeWeek + ""];
    } else {
      console.log("GetIssueUserStatistics:getIssueUserStatistics: required to load");
      const userLog: IssueUSerLog = {};

      const result = await new GetPrintedIssuesList().getIssueWorksheet(activeWeek);

      console.log("GetIssueUserStatistics:getIssueUserStatistics: GetPrintedIssuesList: size", result.issueWorkSheet.issueList.length);

      for (const issue of result.issueWorkSheet.issueList) {
        if (issue.fixedStatus != "TODO" && issue.fixedStatus != "RECOMMENDED") {
          console.log("GetIssueUserStatistics:getIssueUserStatistics: - not allowed state - continue. Status:", issue.fixedStatus);
          continue;
        }

        if (issue.vpOwnerName == "No VP" || issue.vpOwnerName == "" || !issue.vpOwnerName) {
          console.log("GetIssueUserStatistics:getIssueUserStatistics: - no VP - continue");
          continue;
        }

        //console.log("GetIssueUserStatistics:getIssueUserStatistics: - no VP - continue");

        console.log(
          "getActiveIssueWorkSheet:" + "row:",
          issue.rowNumber,
          "fixedStatusCell",
          issue.fixedStatus,
          "projectCell",
          issue.projectKey,
          "ticketCell",
          issue.ticketKey,
          "vpNameCell",
          issue.vpOwnerName,
          "Script",
          issue.scriptName,
        );

        // Vice President
        if (issue.vpOwnerEmail && !userLog[issue.vpOwnerEmail]) {
          console.log("GetIssueUserStatistics:getIssueUserStatistics: add VP into MAP", issue.vpOwnerEmail);
          userLog[issue.vpOwnerEmail] = {
            projects: {},
            issues: {},
            issues_number: 0,
            vpName: issue.vpOwnerName,
          };
        } else {
          console.log("GetIssueUserStatistics:getIssueUserStatistics: VP is in map");
        }

        if (issue.vpOwnerEmail) {
          userLog[issue.vpOwnerEmail].issues_number += 1;
        }

        // Project
        if (issue.vpOwnerEmail && !userLog[issue.vpOwnerEmail].projects[issue.projectKey]) {
          userLog[issue.vpOwnerEmail].projects[issue.projectKey] = {
            issues: {},
            users: {},
            issues_number: 0,
            project_owner_email: issue.projectOwnerEmail,
            project_owner_name: issue.projectOwnerName,
          };
        }

        if (issue.vpOwnerEmail) {
          userLog[issue.vpOwnerEmail].projects[issue.projectKey].issues_number += 1;
        }

        // Issues on VP level

        if (issue.vpOwnerEmail && !userLog[issue.vpOwnerEmail].issues[issue.scriptName]) {
          userLog[issue.vpOwnerEmail].issues[issue.scriptName] = {
            howToFixThat: issue.howToFixIssue,
            issue: [],
          };
        }
        if (issue.vpOwnerEmail) {
          userLog[issue.vpOwnerEmail].issues[issue.scriptName].issue.push(issue);
        }

        // Issue in Project
        if (issue.vpOwnerEmail && !userLog[issue.vpOwnerEmail].projects[issue.projectKey].issues[issue.scriptName]) {
          userLog[issue.vpOwnerEmail].projects[issue.projectKey].issues[issue.scriptName] = {
            howToFixThat: issue.howToFixIssue,
            issue: [],
          };
        }

        if (issue.vpOwnerEmail) {
          userLog[issue.vpOwnerEmail].projects[issue.projectKey].issues[issue.scriptName].issue.push(issue);
        }

        // User in Project
        if (
          issue.vpOwnerEmail &&
          issue.ticketOwnerEmail &&
          !userLog[issue.vpOwnerEmail].projects[issue.projectKey].users[issue.ticketOwnerEmail]
        ) {
          userLog[issue.vpOwnerEmail].projects[issue.projectKey].users[issue.ticketOwnerEmail] = {
            name: issue.ticketOwnerName,
            issues: {},
            issues_number: 0,
          };
        }

        if (
          issue.vpOwnerEmail &&
          issue.ticketOwnerEmail &&
          !userLog[issue.vpOwnerEmail].projects[issue.projectKey].users[issue.ticketOwnerEmail].issues[issue.scriptName]
        ) {
          userLog[issue.vpOwnerEmail].projects[issue.projectKey].users[issue.ticketOwnerEmail].issues[issue.scriptName] = {
            howToFixThat: issue.howToFixIssue,
            issue: [],
          };
        }
        if (issue.vpOwnerEmail && issue.ticketOwnerEmail) {
          userLog[issue.vpOwnerEmail].projects[issue.projectKey].users[issue.ticketOwnerEmail].issues[issue.scriptName].issue.push(issue);
          userLog[issue.vpOwnerEmail].projects[issue.projectKey].users[issue.ticketOwnerEmail].issues_number += 1;
        }
      }

      console.log("GetIssueUserStatistics:getIssueUserStatistics: final check VP size:", Object.keys(userLog).length);

      // Cache and send
      GetIssueUserStatistics.weekSheetCopy[activeWeek + ""] = {
        ...result,
        ...{
          userLog: userLog,
        },
      };
      return GetIssueUserStatistics.weekSheetCopy[activeWeek + ""];
    }
  }
}
