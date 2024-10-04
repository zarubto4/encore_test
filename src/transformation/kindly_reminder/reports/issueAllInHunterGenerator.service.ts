
import moment from "moment";
import {TransformationKindlyReminderUniversalRequest} from "../api_models/controller_models";
import {GetIssueUserStatistics} from "./getIssues/getIssueStatistics";
import {UpdateWeekConditionIntoWeekOverview} from "./dashboard/updateWeekTotalReport";
import {GetDashBoardAndConditions} from "./dashboard/getDashboardAndConditions";
import {CloseAsanaTicketsFromLastWeek} from "./asana/asanaLastWeekCloser";
import {CreateAsanaTasks} from "./asana/createAsanaTasks";
import {GetIssuesByConditionsForWeekReport} from "./issuesHunting/getIssuesByConditionsForWeekReport";
import {ProjectStage} from "./projectWorkSheet/prepareProjectStatsStage.service";
import {IssueStage} from "./getIssues/prepareIssuesSheetStage";
import {GetPrintedIssuesList} from "./getIssues/getPrintedIssues";
import {Print} from "./issuesPrint/printIntWorkSheets";
import {GetFixableIssuesByAutomation} from "./issuesHunting/fixinCapLabourScripts";
import {FindAndSynchronizeProjects} from "./projectWorkSheet/findAndSynchronizeProjects.service";
import {SynchronizeUserWorkSheet} from "./userWorkSheet/synchroniseUserList";
import {UserStage} from "./userWorkSheet/prepareUserStatsStage";
import {ManagerStage} from "./userWorkSheet/prepareManagerStage";
import {kindlyReminder_testProjectConditions} from "../encore.service";
import {IssueProjectStructure} from "./issuesHunting/_models";


export class IssueAllInHunterGenerator {

    // -- Private Values -----------------------------------------------------------------------------------------------

    // - Constructor ---------------------------------------------------------------------------------------------------
    constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------

    public runScript(script: TransformationKindlyReminderUniversalRequest): Promise<void> {
        console.log("IssueAllInHunterGenerator:runScript: name:", script.name);

        return new Promise(async (resolve, reject) => {
            switch (script.name) {

                case "run_whole_script": {
                    this.generate(script.week)
                        .then((result) => {
                            console.log("Result - Request script done:", script.name);
                            resolve();
                        });
                    break;
                }

                /*
                case "run_project_issue_hunting": {

                    for (const projectKey of <string[]> script.value['projects']) {
                        // Find and print all issues by search conditions
                        await new GetIssuesByConditionsForWeekReport()
                            .getProjectIssuesAndPrint(projectKey,  <number> script.value['week'])
                            .then((printResult) => {
                                console.log("Result - Request script done:", script.name);
                            });
                    }
                    break;
                }*/

                case "prepare_issue_stage": {
                    await new IssueStage().getActiveOrCreateActiveIssueWorkSheet(script.week);
                    break;
                }

                case "run_all_allowed_projects": {
                   const allowedProjects = await new ProjectStage().loadProjects( script.week);
                   for (const projectKey of allowedProjects.allowedProjects) {
                        // Find and print all issues by search conditions
                        await new GetIssuesByConditionsForWeekReport().getProjectIssuesAndPrint(projectKey,  script.week);
                   }
                   break;
                }

                case "create_asana_tickets": {
                   await new CreateAsanaTasks().generateAsanaTasks(
                            {
                                week_number: script.week,
                                created: moment().week(script.week).startOf('week').subtract(1, "day"),
                                deadline: moment().week(script.week).startOf('week').subtract(1, "day").add(4, "day")
                            }
                        );
                    break
                }

                case "close_asana_tickets": {
                    await new CloseAsanaTicketsFromLastWeek().closeWeek(script.week);
                    break
                }

                case "read_dashboard": {
                    const dashboardsConfigs = await new GetDashBoardAndConditions().getSearchConditions()
                    console.log("Result - Request script done mandatoryEpicDesignationFields:\n", JSON.stringify(dashboardsConfigs.mandatoryEpicDesignationFields, null, 2));
                    console.log("Result - Request script done projectOverride:\n", JSON.stringify(dashboardsConfigs.projectOverride, null, 2));
                    break;
                }

                case "update_weekly_total_report": {
                    await new UpdateWeekConditionIntoWeekOverview().updateWeekWithNewWorksheet(script.week)
                    break;
                }

                case "get_issue_user_statistics": {
                    const result = await new GetIssueUserStatistics().getIssueUserStatistics(script.week)
                    for (const key of Object.keys(result.userLog)) {
                        console.log("logged VPs:", key);
                        for (const issueScriptNameKEy of Object.keys(result.userLog[key].issues)) {
                            console.log("  scriptName:", issueScriptNameKEy);
                        }
                        for (const projectKey of Object.keys(result.userLog[key].projects)) {
                            console.log("  project:", projectKey);
                        }
                    }
                    break;
                }

                case "get_printed_issues": {
                   await new GetPrintedIssuesList().getIssueWorksheet(script.week);
                   break;
                }

                case "print_projects_stats": {
                    await new Print().printProjectStats(script.week)
                    break;
                }

                case "print_users_stats": {
                    await new Print().printUserStats(script.week)
                    break;
                }

                case "prepare_manager_stage": {
                    await new ManagerStage().getManagers()
                    break;
                }

                case "prepare_user_stage": {
                    await new UserStage().getActiveUserWorkSheet(script.week)
                    break;
                }

                case "synchronise_user_list": {
                   await new SynchronizeUserWorkSheet().synchronize()
                   break;
                }

                case "load_projects": {
                   await new ProjectStage().loadProjects(script.week)
                   break;
                }

                 case "synchronise_projects_with_jira": {
                    await new FindAndSynchronizeProjects().prepareProjects()
                    break;
                }

                case "fix_automated_issues": {
                    await new GetFixableIssuesByAutomation().getAndFixAllCapLabourIssues(script.week)
                    break;
                }
            }
        });

    }

    private generate(activeWeekNumber: number): Promise<void> {

        return new Promise((resolve, reject): void => {

            console.log("generate: init");

            // Get Projects --------------------------------------------------------------------------------------------
            console.log("generate: ProjectStage.prepareProjects");
            new ProjectStage()
                .loadProjects(activeWeekNumber)
                .then((response) => {

                    if (kindlyReminder_testProjectConditions.length > 0) {
                        response.allowedProjects = kindlyReminder_testProjectConditions; // Override list of allowed projects from Worksheet (For developer purpose)
                    }

                    return {
                        projectWorkSheet: response
                    };
                })


                // Get or Create active Worksheet for issues -----------------------------------------------------------
                .then((result) => {
                    console.log("generate: GetPrintedIssuesList");
                    return new GetPrintedIssuesList()
                        .getIssueWorksheet( activeWeekNumber)
                        .then((activeWeekResult) => {
                            return {
                                ...result,
                                activeIssueWeek: activeWeekResult
                            }
                        });
                })

                // Get User worksheet with users and update managers ---------------------------------------------------
                .then((result) => {
                    console.log("generate: UserStage.getActiveUserWorkSheet");
                    return new UserStage()
                        .getActiveUserWorkSheet(activeWeekNumber)
                        .then((userWorkSheet) => {
                            return {...result, userWorkSheet: userWorkSheet}
                        });
                })

                // Get issues from Project -----------------------------------------------------------------------------
                .then(async (result) => {
                    console.log("generate: time to get Issues from Projects:", result.projectWorkSheet.allowedProjects);
                    let issueProjectStructure: IssueProjectStructure = {};
                    for (const projectKey of result.projectWorkSheet.allowedProjects) {
                        // Find and print all issues by search conditions
                        await new GetIssuesByConditionsForWeekReport()
                              .getProjectIssuesAndPrint(projectKey, activeWeekNumber)
                              .then((printResult) => {
                                  issueProjectStructure = Object.assign(issueProjectStructure, printResult)
                              });
                    }
                    return {
                        ...result,
                    };
                })

                // Print And Fix all Fixable issues by Automation ------------------------------------------------------
                .then(async (result) => {
                    return new GetFixableIssuesByAutomation()
                        .getAndFixAllCapLabourIssues(activeWeekNumber)
                        .then((projectStructure) => {
                            return result;
                        });
                })

                // Print project Stats ---------------------------------------------------------------------------------
                .then(async (result) => {
                    console.log("generate: printProjectStats ");
                    return new Print().printProjectStats(activeWeekNumber).then((printResult) => {
                        return result;
                    })
                })

                // Print user Stats ------------------------------------------------------------------------------------
                .then(async (result) => {
                    console.log("generate: printProjectStats ");
                    return new Print().printUserStats(activeWeekNumber).then((printResult) => {
                        return result;
                    })
                })

                // Create Asana Tasks ------------------------------------------------------------------------------------

/*
               .then((result) => {
                   new CreateAsanaTasks()
                       .generateAsanaTasks(
                           {
                               week_number: activeWeekNumber,
                               created: moment().week(activeWeekNumber).startOf('week').subtract(1, "day"),
                               deadline: moment().week(activeWeekNumber).startOf('week').subtract(1, "day").add(4, "day")
                           }
                       )
                       .then((result) => {
                           console.log("Result", result);
                       });
               })*/

             //   Close Prev week Tasks ----------------------------------------------------------------------------------
              .then((result) => {
                  new CloseAsanaTicketsFromLastWeek()
                      .closeWeek(activeWeekNumber - 1)
                      .then((result) => {
                          console.log("Result", result);
                      });
              });
        });
    }

}
