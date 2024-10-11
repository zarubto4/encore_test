import { Issue } from "jira.js/src/version3/models/issue";
import { Project } from "jira.js/src/version3/models/project";
import moment from "moment/moment.js";
import { GetDashBoardAndConditions } from "../dashboard/getDashboardAndConditions";
import { PrintIssuesIntoWorksheet } from "../getIssues/printIssuesIntoWorksheet";
import { DashboardsConfigs, SearchCondition, SearchScripts } from "../dashboard/_models";
import { ConvertedAndAgregatedHoursByIssue } from "../issuesPrint/_models";
import { KindlyReminderConfigApp } from "../../encore.service";
import { IssueProjectStructure, JQLProjectQueries, ProjectStructure, TEMPOLogsXResponse } from "./_models";
import { ExtendedIssue } from "../../../../_libraries/3partyApis/jira/models/jira_extededIssue";
import { WorkLog } from "../../../../_libraries/3partyApis/tempo/models/tempo_workLogsResponse";
import log from "encore.dev/log";

export class GetIssuesByConditionsForWeekReport {
  // -- Private Values -----------------------------------------------------------------------------------------------
  private readonly configApp = new KindlyReminderConfigApp();
  private readonly doneStates: string[] = ["Done", "Won't do it", "Won’t do"];

  // -- Constructor  -------------------------------------------------------------------------------------------------
  // constructor() {}

  // -- Public methods  -----------------------------------------------------------------------------------------------
  public async getProjectIssuesAndPrint(projectKey: string, activeWeekNumber: number): Promise<ProjectStructure> {
    log.trace("GetIssuesByConditionsForWeekReport:getProjectIssuesAndPrint - start");
    log.trace("Project:", projectKey);

    // Report conditions
    const dashboardsConfigs = await new GetDashBoardAndConditions().getSearchConditions();

    // Right Issue Worksheet

    const issueProjectStructure: IssueProjectStructure = {};
    const project = await this.configApp.jiraServices.project.getProject({ projectIdOrKey: projectKey });

    if (project == null) {
      return {
        issues: {},
      };
    }

    const projectStructure = await this.getProjectIssues(project, activeWeekNumber, dashboardsConfigs);
    log.trace("Project " + project.name + " all issues done");
    issueProjectStructure[projectKey] = projectStructure;

    await new PrintIssuesIntoWorksheet().printIssuesIntoActiveWeekSheet(projectStructure, activeWeekNumber);

    return issueProjectStructure[projectKey];
  }

  // Common Project Issues
  public async getProjectIssues(project: Project, activeWeekNumber: number, dashboardsConfigs: DashboardsConfigs): Promise<ProjectStructure> {
    const queries: JQLProjectQueries = new JQLProjectQueries(project.key);
    const projectStructure: ProjectStructure = {
      issues: {},
    };

    // Epic without parent
    if (dashboardsConfigs.searchConditions[SearchScripts.epicWithoutParent] && project.key != "QR" && project.key != "ADMIN" && dashboardsConfigs.searchConditions[SearchScripts.epicWithoutParent].active_rule) {
      for (const ticket of await this.getEpicsWithoutParent(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.epicWithoutParent], ticket);
      }
    }

    // Epic without owner
    if (dashboardsConfigs.searchConditions[SearchScripts.epicWithoutOwner] && project.key != "QR" && project.key != "ADMIN" && dashboardsConfigs.searchConditions[SearchScripts.epicWithoutOwner].active_rule) {
      for (const ticket of await this.getEpicsWithoutOwner(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.epicWithoutOwner], ticket);
      }
    }

    // Epic without field (Epic Designation)
    if (dashboardsConfigs.searchConditions[SearchScripts.epicWithoutDesignation] && project.key != "QR" && project.key != "ADMIN" && dashboardsConfigs.searchConditions[SearchScripts.epicWithoutDesignation].active_rule) {
      for (const ticket of await this.getEpicWithoutProperFieldEpicDesignation(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.epicWithoutDesignation], ticket);
      }
    }

    // Initiative without Parent
    if (dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutParent] && project.key != "QR" && project.key != "ADMIN" && dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutParent].active_rule) {
      for (const ticket of await this.getInitiativesTicketsWithoutParent(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutParent], ticket);
      }
    }

    //  Initiative without owner
    if (dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutOwner] && project.key == "QR" && dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutOwner].active_rule) {
      for (const ticket of await this.getInitiativesWithoutOwner(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutOwner], ticket);
      }
    }

    //  Initiative without Quarts labels
    if (dashboardsConfigs.searchConditions[SearchScripts.initiativeQRLabels] && project.key == "QR" && dashboardsConfigs.searchConditions[SearchScripts.initiativeQRLabels].active_rule) {
      for (const ticket of await this.getInitiativesWithoutQuarterLabels(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.initiativeQRLabels], ticket);
      }
    }

    //  Initiative without field (Initiative category)
    if (dashboardsConfigs.searchConditions[SearchScripts.initiativeQRFieldIC] && project.key == "QR" && dashboardsConfigs.searchConditions[SearchScripts.initiativeQRFieldIC].active_rule) {
      for (const ticket of await this.getInitiativesWithoutProperField(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.initiativeQRFieldIC], ticket);
      }
    }

    //  Initiative without field (Original Estimate (Eng) & Original Estimate (Prd))
    if (dashboardsConfigs.searchConditions[SearchScripts.originalEstimateInitiative] && project.key == "QR" && dashboardsConfigs.searchConditions[SearchScripts.originalEstimateInitiative].active_rule) {
      for (const ticket of await this.getInitiativesWithoutProperOriginalEstimate(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.originalEstimateInitiative], ticket);
      }
    }

    //  Initiative without field (Initiative - Financial Description)
    if (dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutFinancialDescription] && project.key == "QR" && dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutFinancialDescription].active_rule) {
      for (const ticket of await this.getInitiativesWithoutFinancialDescription(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutFinancialDescription], ticket);
      }
    }

    //  Initiative without field (Initiative - Customer Facing)
    if (dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutFinancialCFacing] && project.key == "QR" && dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutFinancialCFacing].active_rule) {
      for (const ticket of await this.getInitiativesWithoutCustomerFacing(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutFinancialCFacing], ticket);
      }
    }

    // theme without Owner
    if (dashboardsConfigs.searchConditions[SearchScripts.themeWithoutOwner] && project.key == "QR" && dashboardsConfigs.searchConditions[SearchScripts.themeWithoutOwner].active_rule) {
      for (const ticket of await this.getThemeWithoutOwner(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.themeWithoutOwner], ticket);
      }
    }

    // theme without field (Strategic Objectives)
    if (dashboardsConfigs.searchConditions[SearchScripts.themeQRFieldSO] && project.key == "QR" && dashboardsConfigs.searchConditions[SearchScripts.themeQRFieldSO].active_rule) {
      for (const ticket of await this.getThemeWithoutProperField(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.themeQRFieldSO], ticket);
      }
    }

    // Tempo tickets without parents
    if (dashboardsConfigs.searchConditions[SearchScripts.tickWithTempoNoParent] && project.key != "QR" && project.key != "ADMIN" && dashboardsConfigs.searchConditions[SearchScripts.tickWithTempoNoParent].active_rule) {
      const getTEMPO_logsX = await this.getTEMPOLogsX(project, activeWeekNumber);
      for (const ticket of getTEMPO_logsX.issues) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.tickWithTempoNoParent], ticket);
        projectStructure.issues[ticket.key].loggedHoursInQ += getTEMPO_logsX.convertorBetweenIdAndKey[ticket.id].loggedHoursInQ;
      }
    }

    // Sprint ticket without owner
    if (dashboardsConfigs.searchConditions[SearchScripts.sprintTicketOwner] && project.key != "QR" && project.key != "ADMIN" && dashboardsConfigs.searchConditions[SearchScripts.sprintTicketOwner].active_rule) {
      for (const ticket of await this.getSprintTicketsWithoutOwner(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.sprintTicketOwner], ticket);
      }
    }

    // Sprint ticket without Original Estimate
    if (dashboardsConfigs.searchConditions[SearchScripts.originalEstimateTicket] && project.key != "QR" && project.key != "ADMIN" && project.key != "RE" && dashboardsConfigs.searchConditions[SearchScripts.originalEstimateTicket].active_rule) {
      for (const ticket of await this.getSprintTicketsWithoutOriginalEstimate(queries)) {
        this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.originalEstimateTicket], ticket);
      }
    }

    log.trace("------------------------------------------------------------------");
    log.trace("Save issues into SpreadSheets - Projects");
    return projectStructure;
  }

  // *** Add to Structure for Printing -------------------------------------------------------------------------------

  private addToStructure(projectStructure: ProjectStructure, ourIssue: SearchCondition, ticket: Issue) {
    log.trace("addToStructure: ticket: " + ticket.key);

    if (!projectStructure.issues[ticket.key]) {
      log.trace("      " + ticket.key + " :addToStructure: add to project as new");
      projectStructure.issues[ticket.key] = {
        jiraTicket: ticket,
        loggedHoursInQ: 0,
        ourIssues: {
          issueName: ourIssue,
        },
      };
    } else if (!projectStructure.issues[ticket.key].ourIssues[ourIssue.script_name]) {
      log.trace("      " + ticket.key + " :addToStructure: add to project as new");
      projectStructure.issues[ticket.key].ourIssues[ourIssue.script_name] = ourIssue;
    }
  }

  // *** Get Issues --------------------------------------------------------------------------------------------------

  // epicWithoutParent
  private getEpicsWithoutParent(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findAllEpicTicketsWithoutParent,
    });
  }

  private getInitiativesTicketsWithoutParent(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findAllInitiativesTicketsWithoutParent,
    });
  }

  public getEpicsWithoutParent_validation(ticket: Issue): string {
    if (ticket == null) {
      return "REMOVED";
    } else {
      const extendedTicket = new ExtendedIssue(ticket);
      if (extendedTicket.parent != null) {
        return "DONE";
      } else {
        return "TODO";
      }
    }
  }

  // Owner ------------------------------------------------------------------------------------------------------------

  private getThemeWithoutOwner(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findAllThemesTicketsWithoutOwner,
    });
  }

  private getSprintTicketsWithoutOwner(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findSprintTicketsWithoutOwner,
    });
  }

  private getEpicsWithoutOwner(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findAllEpicTicketsWithoutOwner,
    });
  }

  private getInitiativesWithoutOwner(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findAllInitiativeTicketsWithoutOwner,
    });
  }

  public getEpicsWithoutOwner_validation(ticket: Issue): string {
    if (ticket == null) {
      return "REMOVED";
    } else {
      const extendedTicket = new ExtendedIssue(ticket);
      if (extendedTicket.assignee != null) {
        return "DONE";
      } else {
        return "TODO";
      }
    }
  }

  // Label ------------------------------------------------------------------------------------------------------------

  private getInitiativesWithoutQuarterLabels(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findAllInitiativeWithoutLabels,
    });
  }

  public async getInitiativesWithoutQuarterLabels_validation(ticket: Issue): Promise<string> {
    if (ticket == null) {
      return "REMOVED";
    } else {
      const extendedTicket = new ExtendedIssue(ticket);

      if (extendedTicket.status == "done") {
        return "DONE";
      }

      if (extendedTicket.labels.includes("24Q3") || extendedTicket.labels.includes("24Q4") || extendedTicket.labels.includes("25QQ")) {
        log.trace("     contains Q3 label or newer");
        return "DONE";
      }

      if (extendedTicket.quartalTags.length > 0) {
        log.trace("     QR label Check: " + ticket.key + " status " + extendedTicket.status + " parent: ", extendedTicket.parent ? extendedTicket.parent.issueKey : " No parent " + " Labels: " + extendedTicket.labels);

        if (!extendedTicket.labels.includes("24Q3") && extendedTicket.parent && extendedTicket.parent.issueKey == "QR-111") {
          log.trace("      - We have KTLO Initiative");

          if (extendedTicket.summary.includes("Permanent")) {
            await this.configApp.jiraServices.issue.updateIssue({
              issueIdOrKey: ticket.key,
              returnIssue: true,
              update: {
                labels: [
                  {
                    add: "KTLO",
                  },
                  {
                    add: "24Q3",
                  },
                ],
              },
            });

            return "DONE";
          }
        }

        if (extendedTicket.parent && extendedTicket.parent.issueKey != "QR-111") {
          if (extendedTicket.quartalTags.includes("24Q2") && !extendedTicket.quartalTags.includes("24Q3") && !extendedTicket.quartalTags.includes("spillover") && extendedTicket.status == "In Progress") {
            log.trace("  QR label contains 24Q2 but it spillover and status is in progress " + ticket.key);

            await this.configApp.jiraServices.issue.updateIssue({
              issueIdOrKey: ticket.key,
              returnIssue: true,
              update: {
                labels: [
                  {
                    add: "spillover",
                  },
                  {
                    add: "24Q3",
                  },
                ],
              },
            });

            return "TODO";
          }
        }

        return "DONE";
      } else {
        log.trace("  No labels for: " + ticket.key);
        return "TODO";
      }
    }
  }

  // Field initiative category ------------------------------------------------------------------------------------------------
  private getInitiativesWithoutProperField(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findAllInitiativeWithoutProperField,
    });
  }

  public getInitiativesWithoutProperField_validation(ticket: Issue): string {
    if (ticket == null) {
      return "REMOVED";
    } else {
      const extendedTicket = new ExtendedIssue(ticket);
      if (extendedTicket.fields["customfield_22036"] != null && extendedTicket.fields["customfield_22036"].value) {
        return "DONE";
      } else {
        return "TODO";
      }
    }
  }

  // Field Original Estimate ------------------------------------------------------------------------------------------------
  private getInitiativesWithoutProperOriginalEstimate(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findAllInitiativeWithoutOriginalEstimate,
    });
  }

  public getInitiativesWithoutOriginalEstimate_validation(ticket: Issue): string {
    if (ticket == null) {
      return "REMOVED";
    } else {
      const extendedTicket = new ExtendedIssue(ticket);
      if (this.doneStates.includes(extendedTicket.status)) {
        return "DONE";
      } else if ((extendedTicket.fields["customfield_22047"] != null && extendedTicket.fields["customfield_22047"].value != "") || (extendedTicket.fields["customfield_22048"] != null && extendedTicket.fields["customfield_22048"].value != "")) {
        return "DONE";
      } else {
        return "TODO";
      }
    }
  }

  // Field Original Estimate ------------------------------------------------------------------------------------------------
  private getInitiativesWithoutFinancialDescription(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findAllInitiativeWithoutFinancialDescription,
    });
  }

  public getInitiativesWithoutFinancialDescription_validation(ticket: Issue): string {
    if (ticket == null) {
      return "REMOVED";
    } else {
      const extendedTicket = new ExtendedIssue(ticket);

      if (extendedTicket.fields["customfield_22184"] != null) {
        if (extendedTicket.fields["customfield_22184"]["content"] != null) {
          let sumContent = "";
          for (const paragraph of extendedTicket.fields["customfield_22184"]["content"]) {
            if (paragraph["type"] == "paragraph") {
              for (const cnt of paragraph["content"]) {
                if (cnt["text"]) {
                  sumContent = sumContent + cnt["text"];
                }
              }
            }
          }

          if (sumContent.length > 32) {
            return "DONE";
          }
        }
      }

      return "TODO";
    }
  }

  // Field Original Estimate ------------------------------------------------------------------------------------------------
  private getInitiativesWithoutCustomerFacing(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findAllInitiativeWithoutCustomerFacing,
    });
  }

  public getInitiativesWithoutCustomerFacing_validation(ticket: Issue): string {
    if (ticket == null) {
      return "REMOVED";
    } else {
      const extendedTicket = new ExtendedIssue(ticket);
      if ((extendedTicket.fields["customfield_22185"] != null && extendedTicket.fields["customfield_22185"].value != "") || (extendedTicket.fields["customfield_22185"] != null && extendedTicket.fields["customfield_22185"].value != "")) {
        return "DONE";
      } else {
        return "TODO";
      }
    }
  }

  private getEpicWithoutProperFieldEpicDesignation(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findAllEpicsWithoutProperFieldEpicDesignation,
    });
  }

  public getEpicWithoutProperFieldEpicDesignation_validation(ticket: Issue): string {
    if (ticket == null) {
      return "REMOVED";
    } else {
      const extendedTicket = new ExtendedIssue(ticket);

      if (this.doneStates.includes(extendedTicket.status)) {
        return "DONE";
      } else if (extendedTicket.fields["customfield_22035"] != null && extendedTicket.fields["customfield_22035"].value) {
        return "DONE";
      } else {
        return "TODO";
      }
    }
  }

  public getEpicKTLOWithoutEpicDesignation_validation(ticket: Issue): string {
    if (ticket == null) {
      return "REMOVED";
    } else {
      const extendedTicket = new ExtendedIssue(ticket);
      if (extendedTicket.fields["customfield_22035"] != null && extendedTicket.fields["customfield_22035"].value == "KTLO") {
        return "DONE";
      } else {
        return "TODO";
      }
    }
  }

  private getThemeWithoutProperField(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findAllThemesWithoutProperField,
    });
  }

  public getThemeWithoutProperField_validation(ticket: Issue): string {
    if (ticket == null) {
      return "REMOVED";
    } else {
      const extendedTicket = new ExtendedIssue(ticket);
      if (extendedTicket.fields["customfield_22046"] != null && extendedTicket.fields["customfield_22046"].value) {
        return "DONE";
      } else {
        return "TODO";
      }
    }
  }

  // Original Estimate -------------------------------------------------------------------------------------

  private getSprintTicketsWithoutOriginalEstimate(queries: JQLProjectQueries): Promise<Issue[]> {
    return this.configApp.jiraServices.issue.getAllIssues({
      jql: queries.findSprintTicketsWithoutOriginalEstimate,
    });
  }

  // Tempo -------------------------------------------------------------------------------------

  private async getTEMPOLogsX(project: Project, activeWeekNumber: number): Promise<TEMPOLogsXResponse> {
    const response = await this.getTEMPOLogs(Number(project.id), project.key, activeWeekNumber);
    for (const ticket of response.issues) {
      log.trace("     Ticket: " + ticket.key + "we are interesting in number of child issues -------------");
      await this.configApp.jiraServices.issue.getAllChildIssues(ticket.key).then(async (childIssues) => {
        log.trace("           : number of child issues: " + childIssues.issues.length);

        let totalSump = 0;
        for (const childIssue of childIssues.issues) {
          if (response.convertorBetweenIdAndKey[childIssue.id]) {
            log.trace("           : Child issue " + childIssue.key, " exist in convertor with all hours: " + response.convertorBetweenIdAndKey[childIssue.id].loggedHoursInQ);
            totalSump += response.convertorBetweenIdAndKey[childIssue.id].loggedHoursInQ;
          } else {
            log.trace("           : Child issue " + childIssue.key + " not Exist in Convertor");
          }
        }
        response.convertorBetweenIdAndKey[ticket.id].loggedHoursInQ += totalSump;
      });
    }
    return response;
  }

  private async getTEMPOLogs(projectID: number, projectKey: string, activeWeekNumber: number): Promise<{ convertorBetweenIdAndKey: ConvertedAndAgregatedHoursByIssue; issues: Issue[]; logs: WorkLog[] }> {
    const result = await this.configApp.tempoService.getUsersWorkLogs({
      projectId: projectID,
      from: moment().week(activeWeekNumber).startOf("quarter").subtract(2, "month").format("YYYY-MM-DD"),
      to: moment().week(activeWeekNumber).endOf("quarter").format("YYYY-MM-DD"),
    });

    const convertorBetweenIdAndKey: ConvertedAndAgregatedHoursByIssue = {};

    result.forEach((log) => {
      if (log.issue) {
        if (!convertorBetweenIdAndKey[log.issue.id]) {
          convertorBetweenIdAndKey[log.issue.id] = {
            loggedHoursInQ: log.timeSpentSeconds ?? 0,
          };
        } else {
          convertorBetweenIdAndKey[log.issue.id].loggedHoursInQ += log.timeSpentSeconds ?? 0;
        }
      }
    });

    const resultIssues = await this.configApp.jiraServices.issue.getUnparentedJiraTicketsLogsByTempo(projectKey, result);
    return {
      convertorBetweenIdAndKey: convertorBetweenIdAndKey,
      issues: resultIssues,
      logs: result,
    };
  }
}
