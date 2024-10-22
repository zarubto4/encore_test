import { Issue } from "jira.js/src/version3/models/issue";
import { GetDashboardAndConditionsService } from "../dashboard/getDashboardAndConditions.service";
import { PrintIssuesIntoWorksheetService } from "../getIssues/printIssuesIntoWorksheet.service";
import { EnuKPI, SearchCondition, SearchScripts } from "../dashboard/dashboardKR.models";
import { JQLProjectQueriesAutomation, ProjectStructure } from "./issueHunting.models";
import { KindlyReminderConfigApp } from "../../encore.service";
import { replaceKeys } from "../../../../../libs/core/parsing_and_formating/stringInject";

export class GetFixableIssuesByAutomation {
  // -- Private Values --------------------------------------------------------------------------------------------------------------------
  private readonly configApp = new KindlyReminderConfigApp();

  // -- Constructor  -------------------------------------------------------------------------------------------------
  // constructor() {}

  // -- Public methods  -----------------------------------------------------------------------------------------------
  public async getAndFixAllCapLabourIssues(activeIssueWeek: number): Promise<ProjectStructure> {
    console.log("------------------------------------------------------------------");
    console.log("GetFixableIssuesByAutomation:getAndFixAllCapLabourIssues - start");

    // Report conditions
    const dashboardsConfigs = await new GetDashboardAndConditionsService().getSearchConditions();

    const queries = new JQLProjectQueriesAutomation();
    const projectStructure: ProjectStructure = {
      issues: {},
    };

    // Epics under KTLO QR-111
    if (
      dashboardsConfigs.searchConditions[SearchScripts.ktloEpicsCheckLabel] &&
      dashboardsConfigs.searchConditions[SearchScripts.ktloEpicsCheckLabel].active_rule
    ) {
      const allIssues = await this.configApp.jiraServices.issue.getAllIssues({
        jql: queries.findKTLOEpicsWithoutEpicDesignation,
      });
      for (const ticket of allIssues) {
        console.log("getAndFixAllCapLabourIssues: ktloEpicsCheckLabel - updating ticket", ticket.key);

        try {
          const resultIssue = await this.configApp.jiraServices.issue.updateIssue({
            issueIdOrKey: ticket.key,
            returnIssue: true,
            notifyUsers: false,
            fields: {
              customfield_22035: {
                value: "KTLO",
              },
              // 25126 Feature or 25127 as KTLO
            },
          });

          if (resultIssue) {
            console.log("  ticket", ticket.key, "updated");
            try {
              this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.ktloEpicsCheckLabel], ticket);
            } catch (error) {
              console.error(
                "getAndFixAllCapLabourIssues: ktloEpicsCheckLabel - addToStructure errors:",
                ticket.key,
                JSON.stringify(dashboardsConfigs.searchConditions),
                "error",
                error,
              );
              console.error(
                "getAndFixAllCapLabourIssues: ktloEpicsCheckLabel - addToStructure errors:",
                ticket.key,
                "type",
                SearchScripts.ktloEpicsCheckLabel,
                "json:",
                dashboardsConfigs.searchConditions[SearchScripts.ktloEpicsCheckLabel]
                  ? JSON.stringify(dashboardsConfigs.searchConditions[SearchScripts.ktloEpicsCheckLabel])
                  : "Not available",
              );
            }
          } else {
            console.error("getAndFixAllCapLabourIssues: ktloEpicsCheckLabel: Something bad happens - no issues from server");
          }
        } catch (error) {
          console.log(
            "getAndFixAllCapLabourIssues: ktloEpicsCheckLabel - Update error for ticket:",
            ticket.key,
            JSON.stringify(dashboardsConfigs.searchConditions),
            "error",
            error,
          );
          try {
            this.addToStructure(
              projectStructure,
              {
                script_name: SearchScripts.ktloEpicsCheckLabel,
                active_rule: true,
                kpi_policy: EnuKPI.Mandatory,
                policy_description: "Every Epic ticket under KTLO Theme QR-111 must be set as KTLO on Field Epic Designation",
                how_to_fix_description: "Set KTLO value in filed Epic Designation in this ticket",
                who_will_be_responsible_description:
                  dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].who_will_be_responsible_description,
                jql_query: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].jql_query,
                priorityTicketOwnership:
                  dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].priorityTicketOwnership,
              },
              ticket,
            );
          } catch (error) {
            console.error(
              "getAndFixAllCapLabourIssues: ktloEpicsCheckLabel - error:",
              dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck],
              "error",
              error,
            );
          }
        }
      }
    }

    // No Epics with label Epic Designation
    if (
      dashboardsConfigs.searchConditions[SearchScripts.nonEpicsWithEpicDesignation] &&
      dashboardsConfigs.searchConditions[SearchScripts.nonEpicsWithEpicDesignation].active_rule
    ) {
      const allTickets = await this.configApp.jiraServices.issue.getAllIssues({
        jql: queries.findNonEpicsWithEpicDesignation,
      });

      for (const ticket of allTickets) {
        console.log(
          "getAndFixAllCapLabourIssues: nonEpicsWithEpicDesignation - updating ticket",
          ticket.key,
          JSON.stringify(dashboardsConfigs.searchConditions),
        );
        try {
          await this.configApp.jiraServices.issue.updateIssue({
            issueIdOrKey: ticket.key,
            returnIssue: true,
            notifyUsers: false,
            fields: {
              customfield_22035: null,
            },
          });
          this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.nonEpicsWithEpicDesignation], ticket);
        } catch (error) {
          console.log("getAndFixAllCapLabourIssues: nonEpicsWithEpicDesignation - Update error for ticket:", ticket.key, "error", error);
          try {
            this.addToStructure(
              projectStructure,
              {
                script_name: SearchScripts.nonEpicsWithEpicDesignation,
                active_rule: true,
                kpi_policy: EnuKPI.Mandatory,
                policy_description:
                  "Each non-epic ticket must not contain a completed Designation field Epic Designation. It must be Empty",
                how_to_fix_description: "Remove KTLO or Feature value in filed Epic Designation in this ticket",
                who_will_be_responsible_description:
                  dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].who_will_be_responsible_description,
                jql_query: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].jql_query,
                priorityTicketOwnership:
                  dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].priorityTicketOwnership,
              },
              ticket,
            );
          } catch (err) {
            console.log(
              "getAndFixAllCapLabourIssues: nonEpicsWithEpicDesignation - error",
              dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck],
              err,
            );
          }
        }
      }
    }

    // Mandatory Epic Designation Fixed - KTLO or Feature by dashboard Config
    if (
      dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck] &&
      dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].active_rule
    ) {
      if (dashboardsConfigs.mandatoryEpicDesignationFields.featureProjects.length > 0) {
        let projectsFeatureForJira = "";
        for (let i = 0; i < dashboardsConfigs.mandatoryEpicDesignationFields.featureProjects.length; i++) {
          if (i + 1 < dashboardsConfigs.mandatoryEpicDesignationFields.featureProjects.length) {
            projectsFeatureForJira = projectsFeatureForJira + dashboardsConfigs.mandatoryEpicDesignationFields.featureProjects[i] + ",";
          } else {
            projectsFeatureForJira = projectsFeatureForJira + dashboardsConfigs.mandatoryEpicDesignationFields.featureProjects[i];
          }
        }

        for (const ticket of await this.configApp.jiraServices.issue.getAllIssues({
          jql: replaceKeys(queries.findAndFixAllNonHardlySetEpicDesignations, {
            type: "Feature",
            projects: projectsFeatureForJira,
          }),
        })) {
          try {
            console.log(
              "getAndFixAllCapLabourIssues:getAndFixAllCapLabourIssues: mandatoryFieldForEpicCheck - updating ticket",
              ticket.key,
            );
            await this.configApp.jiraServices.issue.updateIssue({
              issueIdOrKey: ticket.key,
              returnIssue: true,
              notifyUsers: false,
              fields: {
                customfield_22035: {
                  value: "Feature",
                },
              },
            });

            console.log("  ticket", ticket.key, "updated");
            this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck], ticket);
          } catch (error) {
            console.log(
              "getAndFixAllCapLabourIssues:getAndFixAllCapLabourIssues: mandatoryFieldForEpicCheck Feature: - Update error for ticket:",
              ticket.key,
              "error",
              error,
            );
            try {
              this.addToStructure(
                projectStructure,
                {
                  script_name: SearchScripts.mandatoryFieldForEpicCheck,
                  active_rule: true,
                  kpi_policy: EnuKPI.Mandatory,
                  policy_description: "This Epic ticket in Field Epic Designation must be hardly set to FEATURE.",
                  how_to_fix_description: "Set FEATURE value in filed Epic Designation in this ticket",
                  who_will_be_responsible_description:
                    dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].who_will_be_responsible_description,
                  jql_query: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].jql_query,
                  priorityTicketOwnership:
                    dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].priorityTicketOwnership,
                },
                ticket,
              );
            } catch (error) {
              console.error(
                "getAndFixAllCapLabourIssues:getAndFixAllCapLabourIssues:  - error",
                dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck],
                error,
              );
            }
          }
        }
      }

      if (dashboardsConfigs.mandatoryEpicDesignationFields.ktloProjects.length > 0) {
        let projectsKTLOForJira = "";
        for (let i = 0; i < dashboardsConfigs.mandatoryEpicDesignationFields.ktloProjects.length; i++) {
          if (i + 1 < dashboardsConfigs.mandatoryEpicDesignationFields.ktloProjects.length) {
            projectsKTLOForJira = projectsKTLOForJira + dashboardsConfigs.mandatoryEpicDesignationFields.ktloProjects[i] + ",";
          } else {
            projectsKTLOForJira = projectsKTLOForJira + dashboardsConfigs.mandatoryEpicDesignationFields.ktloProjects[i];
          }
        }

        const allTickets = await this.configApp.jiraServices.issue.getAllIssues({
          jql: replaceKeys(queries.findAndFixAllNonHardlySetEpicDesignations, {
            type: "KTLO",
            projects: projectsKTLOForJira,
          }),
        });

        for (const ticket of allTickets) {
          console.log(
            "getAndFixAllCapLabourIssues:getAndFixAllCapLabourIssues: mandatoryEpicDesignationFields KTLO: - updating ticket",
            ticket.key,
          );
          try {
            await this.configApp.jiraServices.issue.updateIssue({
              issueIdOrKey: ticket.key,
              returnIssue: true,
              notifyUsers: false,
              fields: {
                customfield_22035: {
                  value: "KTLO",
                },
              },
            });

            this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck], ticket);
            console.log("  ticket", ticket.key, "updated");
          } catch (error) {
            console.log(
              "getAndFixAllCapLabourIssues:getAndFixAllCapLabourIssues: mandatoryEpicDesignationFields - Update error for ticket:",
              ticket.key,
              "error",
              error,
            );
            try {
              this.addToStructure(
                projectStructure,
                {
                  script_name: SearchScripts.mandatoryFieldForEpicCheck,
                  active_rule: true,
                  kpi_policy: EnuKPI.Mandatory,
                  policy_description: "This Epic ticket in Field Epic Designation must be hardly set to KTLO.",
                  how_to_fix_description: "Set KTLO value in filed Epic Designation in this ticket",
                  who_will_be_responsible_description:
                    dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].who_will_be_responsible_description,
                  jql_query: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].jql_query,
                  priorityTicketOwnership:
                    dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].priorityTicketOwnership,
                },
                ticket,
              );
            } catch (err) {
              console.log(
                "getAndFixAllCapLabourIssues:getAndFixAllCapLabourIssues: mandatoryEpicDesignationFields - error",
                dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck],
                err,
              );
            }
          }
        }
      }
    }

    console.log("getAndFixAllCapLabourIssues:getAndFixAllCapLabourIssues: time to print all issues");
    await new PrintIssuesIntoWorksheetService().printIssuesIntoActiveWeekSheet(projectStructure, activeIssueWeek);

    return projectStructure;
  }

  // *** Add to Structure for Printing -------------------------------------------------------------------------------

  private addToStructure(projectStructure: ProjectStructure, ourIssue: SearchCondition, ticket: Issue) {
    console.log("addToStructure: ticket", ticket.key);

    if (!projectStructure.issues[ticket.key]) {
      console.log("      ", ticket.key, ":addToStructure: add to project as new");
      projectStructure.issues[ticket.key] = {
        jiraTicket: ticket,
        loggedHoursInQ: 0,
        ourIssues: {
          issueName: ourIssue,
        },
      };
    } else if (!projectStructure.issues[ticket.key].ourIssues[ourIssue.script_name]) {
      console.log("      ", ticket.key, ":addToStructure: add to project as new");
      projectStructure.issues[ticket.key].ourIssues[ourIssue.script_name] = ourIssue;
    }
  }
}
