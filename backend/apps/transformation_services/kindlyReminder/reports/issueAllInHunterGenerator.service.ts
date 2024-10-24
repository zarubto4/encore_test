import moment from "moment";
import { TransformationKindlyReminderUniversalRequest } from "../api_models/controllers.models";
import { GetIssueUserStatistics } from "./getIssues/getIssueStatistics.service";
import { UpdateWeekConditionIntoWeekOverview } from "./dashboard/updateWeekTotalReport.service";
import { GetDashboardAndConditionsService } from "./dashboard/getDashboardAndConditions.service";
import { CloseAsanaTicketsFromLastWeek } from "./asana/asanaLastWeekCloser.service";
import { CreateAsanaTasksService } from "./asana/createAsanaTasks.service";
import { GetIssuesByConditionsForWeekReportService } from "./issuesHunting/getIssuesByConditionsForWeekReport.service";
import { ProjectStage } from "./projectWorkSheet/prepareProjectStatsStage.service";
import { IssueStage } from "./getIssues/prepareIssuesSheetStage.service";
import { GetPrintedIssuesList } from "./getIssues/getPrintedIssues.service";
import { Print } from "./issuesPrint/issuePrint.service";
import { GetFixableIssuesByAutomation } from "./issuesHunting/fixinCapLabourScripts.service";
import { FindAndSynchronizeProjects } from "./projectWorkSheet/findAndSynchronizeProjects.service";
import { SynchronizeUserWorkSheet } from "./userWorkSheet/synchroniseUserList.service";
import { UserStage } from "./userWorkSheet/prepareUserStatsStage.service";
import { ManagerStage } from "./userWorkSheet/prepareManagerStage.service";
import { kindlyReminder_testProjectConditions } from "../encore.service";
import { IssueProjectStructure } from "./issuesHunting/issueHunting.models";
import log from "encore.dev/log";

export class IssueAllInHunterGenerator {
  // -- Private Values -----------------------------------------------------------------------------------------------

  // - Constructor ---------------------------------------------------------------------------------------------------
  // constructor() {}

  // -- Public methods  -----------------------------------------------------------------------------------------------

  public async runScript(script: TransformationKindlyReminderUniversalRequest): Promise<void> {
    log.debug("IssueAllInHunterGenerator:runScript: name: " + script.name);
    switch (script.name) {
      case "run_whole_script": {
        await this.generate(script.week);
        break;
      }

      case "prepare_issue_stage": {
        await new IssueStage().getActiveOrCreateActiveIssueWorkSheet(script.week);
        break;
      }

      case "run_all_allowed_projects": {
        const allowedProjects = await new ProjectStage().loadProjects(script.week);
        for (const projectKey of allowedProjects.allowedProjects) {
          // Find and print all issues by search conditions
          await new GetIssuesByConditionsForWeekReportService().getProjectIssuesAndPrint(projectKey, script.week);
        }
        break;
      }

      case "create_asana_tickets": {
        await new CreateAsanaTasksService().generateAsanaTasks({
          week_number: script.week,
          created: moment().week(script.week).startOf("week").subtract(1, "day"),
          deadline: moment().week(script.week).startOf("week").subtract(1, "day").add(6, "day"),
        });
        break;
      }

      case "close_asana_tickets": {
        await new CloseAsanaTicketsFromLastWeek().closeWeek(script.week);
        break;
      }

      case "read_dashboard": {
        const dashboardsConfigs = await new GetDashboardAndConditionsService().getSearchConditions();
        log.trace(
          "Result - Request script done mandatoryEpicDesignationFields:\n" +
            JSON.stringify(dashboardsConfigs.mandatoryEpicDesignationFields, null, 2),
        );
        log.trace("Result - Request script done projectOverride:\n" + JSON.stringify(dashboardsConfigs.projectOverride, null, 2));
        break;
      }

      case "update_weekly_total_report": {
        await new UpdateWeekConditionIntoWeekOverview().updateWeekWithNewWorksheet(script.week);
        break;
      }

      case "get_issue_user_statistics": {
        const result = await new GetIssueUserStatistics().getIssueUserStatistics(script.week);
        for (const key of Object.keys(result.userLog)) {
          log.trace("logged VPs:", key);
          for (const issueScriptNameKEy of Object.keys(result.userLog[key].issues)) {
            log.trace("  scriptName:", issueScriptNameKEy);
          }
          for (const projectKey of Object.keys(result.userLog[key].projects)) {
            log.trace("  project:", projectKey);
          }
        }
        break;
      }

      case "get_printed_issues": {
        await new GetPrintedIssuesList().getIssueWorksheet(script.week);
        break;
      }

      case "print_projects_stats": {
        await new Print().printProjectStats(script.week);
        break;
      }

      case "print_users_stats": {
        await new Print().printUserStats(script.week);
        break;
      }

      case "prepare_manager_stage": {
        await new ManagerStage().getManagers();
        break;
      }

      case "prepare_user_stage": {
        await new UserStage().getActiveUserWorkSheet(script.week);
        break;
      }

      case "synchronise_user_list": {
        await new SynchronizeUserWorkSheet().synchronize();
        break;
      }

      case "load_projects": {
        await new ProjectStage().loadProjects(script.week);
        break;
      }

      case "synchronise_projects_with_jira": {
        await new FindAndSynchronizeProjects().prepareProjects();
        break;
      }

      case "fix_automated_issues": {
        await new GetFixableIssuesByAutomation().getAndFixAllCapLabourIssues(script.week);
        break;
      }
    }
  }

  private async generate(activeWeekNumber: number): Promise<void> {
    log.trace("generate: init");

    // Get Projects ------------------------------------------------------------------------------------------------
    log.trace("generate: ProjectStage.prepareProjects");
    const projectWorkSheet = await new ProjectStage().loadProjects(activeWeekNumber);
    if (kindlyReminder_testProjectConditions.length > 0) {
      projectWorkSheet.allowedProjects = kindlyReminder_testProjectConditions; // Override list of allowed projects from Worksheet (For developer purpose)
    }

    // Get or Create active Worksheet for issues -------------------------------------------------------------------
    const activeWeekResult = await new GetPrintedIssuesList().getIssueWorksheet(activeWeekNumber);
    log.trace("generate: activeWeekResult" + activeWeekResult);

    // Get User worksheet with users and update managers -----------------------------------------------------------
    const userWorkSheetResult = await new UserStage().getActiveUserWorkSheet(activeWeekNumber);
    log.trace("generate: userWorkSheetResult", userWorkSheetResult);

    // Get issues from Project -------------------------------------------------------------------------------------
    log.trace("generate: time to get Issues from Projects:" + projectWorkSheet.allowedProjects);
    let issueProjectStructure: IssueProjectStructure = {};
    for (const projectKey of projectWorkSheet.allowedProjects) {
      // Find and print all issues by search conditions
      const printResult = await new GetIssuesByConditionsForWeekReportService().getProjectIssuesAndPrint(projectKey, activeWeekNumber);
      issueProjectStructure = Object.assign(issueProjectStructure, printResult);
    }

    // Print And Fix all Fixable issues by Automation --------------------------------------------------------------
    const projectStructure = await new GetFixableIssuesByAutomation().getAndFixAllCapLabourIssues(activeWeekNumber);
    issueProjectStructure = Object.assign(issueProjectStructure, projectStructure);
    log.trace("generate: projectStructure done:" + projectStructure);

    // Print project Stats -----------------------------------------------------------------------------------------
    const printProjectResult = await new Print().printProjectStats(activeWeekNumber);
    log.trace("generate: printProjectStats done:" + printProjectResult);

    // Print user Stats --------------------------------------------------------------------------------------------
    // const printUserResult = await new Print().printUserStats(activeWeekNumber);
    // log.trace("generate: printProjectStats done:" + printUserResult);

    // Create Asana Tasks ------------------------------------------------------------------------------------
    /* const createAsanaTaskResult = await new CreateAsanaTasks().generateAsanaTasks({
      week_number: activeWeekNumber,
      created: moment().week(activeWeekNumber).startOf("week").subtract(1, "day"),
      deadline: moment().week(activeWeekNumber).startOf("week").subtract(1, "day").add(5, "day"),
    });
     log.trace("generate: createAsanaTaskResult done:" + createAsanaTaskResult);
    */
  }
}
