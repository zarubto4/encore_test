import { GetIssuesByConditionsForWeekReportService } from "../issuesHunting/getIssuesByConditionsForWeekReport.service";
import { Issue } from "jira.js/src/version3/models/issue";
import { SearchScripts } from "../dashboard/dashboardKR.models";

export class JiraIssueValidator {
  // -- Private Values -----------------------------------------------------------------------------------------------

  // -- Constructor  -------------------------------------------------------------------------------------------------
  // constructor() {}

  // -- Public methods  -----------------------------------------------------------------------------------------------
  public validations(scriptName: string, ticket: Issue): Promise<string> {
    return new Promise((resolve) => {
      const conditionsForWeekReport = new GetIssuesByConditionsForWeekReportService();

      if (
        scriptName == SearchScripts.epicWithoutParent ||
        scriptName == SearchScripts.tickWithTempoNoParent ||
        scriptName == SearchScripts.initiativeWithoutParent ||
        scriptName == SearchScripts.tickWithTempoNoParent
      ) {
        return resolve(conditionsForWeekReport.getEpicsWithoutParent_validation(ticket));
      } else if (
        scriptName == SearchScripts.sprintTicketOwner ||
        scriptName == SearchScripts.themeWithoutOwner ||
        scriptName == SearchScripts.initiativeWithoutOwner ||
        scriptName == SearchScripts.epicWithoutOwner
      ) {
        return resolve(conditionsForWeekReport.getEpicsWithoutOwner_validation(ticket));
      } else if (scriptName == SearchScripts.initiativeQRLabels) {
        return resolve(conditionsForWeekReport.getInitiativesWithoutQuarterLabels_validation(ticket));
      } else if (scriptName == SearchScripts.initiativeWithoutFinancialCFacing) {
        return resolve(conditionsForWeekReport.getInitiativesWithoutCustomerFacing_validation(ticket));
      } else if (scriptName == SearchScripts.initiativeWithoutFinancialDescription) {
        return resolve(conditionsForWeekReport.getInitiativesWithoutFinancialDescription_validation(ticket));
      } else if (scriptName == SearchScripts.initiativeQRFieldIC) {
        return resolve(conditionsForWeekReport.getInitiativesWithoutProperField_validation(ticket));
      } else if (scriptName == SearchScripts.originalEstimateInitiative) {
        return resolve(conditionsForWeekReport.getInitiativesWithoutOriginalEstimate_validation(ticket));
      } else if (scriptName == SearchScripts.themeQRFieldSO) {
        return resolve(conditionsForWeekReport.getThemeWithoutProperField_validation(ticket));
      } else if (scriptName == SearchScripts.epicWithoutDesignation) {
        return resolve(conditionsForWeekReport.getEpicWithoutProperFieldEpicDesignation_validation(ticket));
      } else if (scriptName == SearchScripts.ktloEpicsCheckLabel) {
        return resolve(conditionsForWeekReport.getEpicKTLOWithoutEpicDesignation_validation(ticket));
      }

      console.error("Warning - check condition", scriptName, "is not supported");
      resolve("TODO");
    });
  }
}
