import {
  DashBoardQRProjectOverridesCellIndexes,
  DashboardsConfigs,
  EnuKPI,
  FindTableIndexesForScriptConditionsResult,
  MandatoryEpicDesignationFieldsCellIndexes,
  SearchConditionsCellIndexes,
  SearchScripts,
} from "./dashboardKR.models";
import { kindlyReminder_dashboardWorkSheetId, kindlyReminder_spreadSheetId, KindlyReminderConfigApp } from "../../encore.service";
import { SpreadSheetWorkSheet } from "../../../../../libs/3partyApis/googleDocs/models/config";
import { GoogleSpreadsheetWorksheet } from "google-spreadsheet";

/**
 * Intended for extracting rules from the initial worksheet.
 * First, we find the keyword "programmatic::rulesForScriptStar" (In the document, it is white, so no one can see it)
 * and then we find "programmatic::rulesForScriptEnd". Everything in between is content for our script.
 */
export class GetDashboardAndConditionsService {
  // -- Private Values -----------------------------------------------------------------------------------------------
  protected static dashboardsConfigs: DashboardsConfigs;

  private readonly dashboardCondition = {
    scriptCells: new SearchConditionsCellIndexes(),
    qrOverridesCells: new DashBoardQRProjectOverridesCellIndexes(),
    epicMandatoryDesignation: new MandatoryEpicDesignationFieldsCellIndexes(),
  };

  private readonly scriptConditionStart = "programmatic::rulesForScriptStart";
  private readonly scriptConditionEnd = "programmatic::rulesForScriptEnd";

  private readonly qrProjectOverridesStart = "programmatic::qrProjectOverrideStart";
  private readonly qrProjectOverridesEnd = "programmatic::qrProjectOverrideEnd";

  private readonly mandatoryEpicDesignationStart = "programmatic::conditionsForCapLabourStart";
  private readonly mandatoryEpicDesignationEnd = "programmatic::conditionsForCapLabourEnd";

  private readonly configApp = new KindlyReminderConfigApp();

  // - Constructor ---------------------------------------------------------------------------------------------------
  // constructor () {}

  // -- Public methods  -----------------------------------------------------------------------------------------------
  public async getSearchConditions(): Promise<DashboardsConfigs> {
    console.log("GetDashBoardAndConditions:getSearchConditions: init ===============================================");

    if (GetDashboardAndConditionsService.dashboardsConfigs) {
      console.log("GetDashBoardAndConditions:getSearchConditions: already have searchConditions, return immediately");
      return GetDashboardAndConditionsService.dashboardsConfigs;
    }

    console.log("GetDashBoardAndConditions:getSearchConditions: kindlyReminder_spreadSheetId:", kindlyReminder_spreadSheetId);
    console.log("GetDashBoardAndConditions:getSearchConditions: kindlyReminder_dashboardWorkSheetId:", kindlyReminder_dashboardWorkSheetId);

    const result = await this.configApp.googleServices.spreadsheet.getSpreadsheetWithWorksheet(
      kindlyReminder_spreadSheetId,
      kindlyReminder_dashboardWorkSheetId,
    );

    GetDashboardAndConditionsService.dashboardsConfigs = {
      searchConditions: {},
      projectOverride: {},
      mandatoryEpicDesignationFields: {
        ktloProjects: [],
        featureProjects: [],
      },
    };

    const indexesScriptConditions = await this.findTableIndexesForScriptConditions(
      result,
      this.scriptConditionStart,
      this.scriptConditionEnd,
    );
    this.scriptConditionStartParser(indexesScriptConditions, result.sheet);

    const indexesProjectOverrides = await this.findTableIndexesForScriptConditions(
      result,
      this.qrProjectOverridesStart,
      this.qrProjectOverridesEnd,
    );
    this.projectOverridesParser(indexesProjectOverrides, result.sheet);

    const indexesMandatoryEpicDesignation = await this.findTableIndexesForScriptConditions(
      result,
      this.mandatoryEpicDesignationStart,
      this.mandatoryEpicDesignationEnd,
    );
    await this.mandatoryEpicDesignation(indexesMandatoryEpicDesignation, result.sheet);

    return GetDashboardAndConditionsService.dashboardsConfigs;
  }

  // --- Helpers -----------------------------------------------------------------------------------------------------

  private async mandatoryEpicDesignation(indexes: FindTableIndexesForScriptConditionsResult, sheet: GoogleSpreadsheetWorksheet) {
    // Offset correction
    indexes.indexForSearchConditionsEnd = indexes.indexForSearchConditionsEnd - 1;
    indexes.indexForSearchConditionsStart = indexes.indexForSearchConditionsStart + 2;

    let ktloProjectsString: string | undefined = sheet.getCellByA1(
      this.dashboardCondition.epicMandatoryDesignation.scriptsCells.projectListColumn + indexes.indexForSearchConditionsStart,
    ).stringValue;
    if (!ktloProjectsString) {
      throw Error("ktloProjectsString is missing");
    }

    let featureProjectsString: string | undefined = sheet.getCellByA1(
      this.dashboardCondition.epicMandatoryDesignation.scriptsCells.projectListColumn + indexes.indexForSearchConditionsEnd,
    ).stringValue;
    if (!featureProjectsString) {
      throw Error("featureProjectsString is missing");
    }

    ktloProjectsString = ktloProjectsString.replace(/\s/g, "");
    featureProjectsString = featureProjectsString.replace(/\s/g, "");

    const foundProjects = await this.configApp.jiraServices.project.getAllProjects({ orderBy: "name", status: ["live"] });

    console.log("GetDashBoardAndConditions:mandatoryEpicDesignation Checking - projects from JIRA:", foundProjects.length);

    const ktloListFiltered: string[] = [];

    ktloProjectsString.split(";").forEach((prjKeyUnChecked) => {
      if (foundProjects.find((pr) => pr.key === prjKeyUnChecked && pr.archived != true)) {
        ktloListFiltered.push(prjKeyUnChecked);
      } else {
        console.log("GetDashBoardAndConditions:mandatoryEpicDesignation: ktlo:Checking Excluded project:", prjKeyUnChecked);
      }
    });

    const featureListFiltered: string[] = [];

    featureProjectsString.split(";").forEach((prjKeyUnChecked) => {
      if (foundProjects.find((pr) => pr.key === prjKeyUnChecked && pr.archived != true)) {
        featureListFiltered.push(prjKeyUnChecked);
      } else {
        console.log("GetDashBoardAndConditions:mandatoryEpicDesignation: feature:Checking Excluded project:", prjKeyUnChecked);
      }
    });

    GetDashboardAndConditionsService.dashboardsConfigs.mandatoryEpicDesignationFields = {
      ktloProjects: ktloListFiltered,
      featureProjects: featureListFiltered,
    };

    console.log(
      "GetDashBoardAndConditions:mandatoryEpicDesignation: returning conditions",
      Object.keys(GetDashboardAndConditionsService.dashboardsConfigs.mandatoryEpicDesignationFields).length,
    );
  }

  private projectOverridesParser(indexes: FindTableIndexesForScriptConditionsResult, sheet: GoogleSpreadsheetWorksheet) {
    // Offset correction
    indexes.indexForSearchConditionsEnd = indexes.indexForSearchConditionsEnd - 1;
    indexes.indexForSearchConditionsStart = indexes.indexForSearchConditionsStart + 3;

    for (let rowIndex = indexes.indexForSearchConditionsStart; rowIndex <= indexes.indexForSearchConditionsEnd; rowIndex++) {
      const ticket: string | undefined = sheet.getCellByA1(
        this.dashboardCondition.qrOverridesCells.overridesCells.ticketColumn + rowIndex,
      ).stringValue;
      if (!ticket) {
        throw Error("ticketColumn is missing");
      }

      const vp_name: string | undefined = sheet.getCellByA1(
        this.dashboardCondition.qrOverridesCells.overridesCells.vpEmailColum + rowIndex,
      ).stringValue;
      if (!vp_name) {
        throw Error("vp_name is missing");
      }

      const vp_email: string | undefined = sheet.getCellByA1(
        this.dashboardCondition.qrOverridesCells.overridesCells.vpEmailColum + rowIndex,
      ).stringValue;
      if (!vp_email) {
        throw Error("vp_email is missing");
      }

      const project_owner_name: string | undefined = sheet.getCellByA1(
        this.dashboardCondition.qrOverridesCells.overridesCells.projectOwnerNameColumn + rowIndex,
      ).stringValue;
      if (!project_owner_name) {
        throw Error("project_owner_name is missing");
      }

      const project_owner_email: string | undefined = sheet.getCellByA1(
        this.dashboardCondition.qrOverridesCells.overridesCells.projectOwnerEmailColumn + rowIndex,
      ).stringValue;
      if (!project_owner_email) {
        throw Error("project_owner_email is missing");
      }

      GetDashboardAndConditionsService.dashboardsConfigs.projectOverride[ticket] = {
        vp_name: vp_name,
        vp_email: vp_email,
        project_owner_name: project_owner_name,
        project_owner_email: project_owner_email,
      };
    }
    console.log(
      "GetDashBoardAndConditions:projectOverridesParser: returning conditions",
      Object.keys(GetDashboardAndConditionsService.dashboardsConfigs.projectOverride).length,
    );
  }

  private scriptConditionStartParser(indexes: FindTableIndexesForScriptConditionsResult, sheet: GoogleSpreadsheetWorksheet) {
    // Offset correction
    indexes.indexForSearchConditionsEnd = indexes.indexForSearchConditionsEnd - 1;
    indexes.indexForSearchConditionsStart = indexes.indexForSearchConditionsStart + 2;

    for (let rowIndex = indexes.indexForSearchConditionsStart; rowIndex <= indexes.indexForSearchConditionsEnd; rowIndex++) {
      const implementationStatus: string | undefined = sheet.getCellByA1(
        this.dashboardCondition.scriptCells.scriptsCells.implementationStatus + rowIndex,
      ).stringValue;
      if (!implementationStatus) {
        throw Error(
          'Dashboard script configurator table with script: "implementationStatus" is missing on cell: ' +
            this.dashboardCondition.scriptCells.scriptsCells.implementationStatus +
            rowIndex,
        );
      }

      if (implementationStatus != "Implemented") {
        continue;
      }

      const script_name: string | undefined = sheet.getCellByA1(
        this.dashboardCondition.scriptCells.scriptsCells.scriptNameColumn + rowIndex,
      ).stringValue;
      if (!script_name) {
        throw Error(
          'Dashboard script configurator table with script: "script_name" is missing on cell: ' +
            this.dashboardCondition.scriptCells.scriptsCells.scriptNameColumn +
            rowIndex,
        );
      }

      const kpi_policy: string | undefined = sheet.getCellByA1(
        this.dashboardCondition.scriptCells.scriptsCells.kpiPolicyColumn + rowIndex,
      ).stringValue;
      if (!kpi_policy) {
        throw Error(
          'Dashboard script configurator table with script: "kpi_policy" is missing on cell: ' +
            this.dashboardCondition.scriptCells.scriptsCells.scriptNameColumn +
            rowIndex,
        );
      }

      const policy_description: string | undefined = sheet.getCellByA1(
        this.dashboardCondition.scriptCells.scriptsCells.policyDescriptionColumn + rowIndex,
      ).stringValue;
      if (!policy_description) {
        throw Error(
          'Dashboard script configurator table with script: "policy_description" is missing on cell: ' +
            this.dashboardCondition.scriptCells.scriptsCells.scriptNameColumn +
            rowIndex,
        );
      }

      const who_will_be_responsible_description: string | undefined = sheet.getCellByA1(
        this.dashboardCondition.scriptCells.scriptsCells.whoWillBeResponsibleDescriptionColumn + rowIndex,
      ).stringValue;
      if (!who_will_be_responsible_description) {
        throw Error(
          'Dashboard script configurator table with script: "who_will_be_responsible_description" is missing on cell: ' +
            this.dashboardCondition.scriptCells.scriptsCells.scriptNameColumn +
            rowIndex,
        );
      }

      const how_to_fix_description: string | undefined = sheet.getCellByA1(
        this.dashboardCondition.scriptCells.scriptsCells.howToFixDescriptionColumn + rowIndex,
      ).stringValue;
      if (!how_to_fix_description) {
        throw Error(
          'Dashboard script configurator table with script: "how_to_fix_description" is missing on cell: ' +
            this.dashboardCondition.scriptCells.scriptsCells.scriptNameColumn +
            rowIndex,
        );
      }

      const jql_query: string | undefined = sheet.getCellByA1(
        this.dashboardCondition.scriptCells.scriptsCells.jqlQueryColumn + rowIndex,
      ).stringValue;
      if (!jql_query) {
        throw Error(
          'Dashboard script configurator table with script: "jql_query" is missing on cell: ' +
            this.dashboardCondition.scriptCells.scriptsCells.scriptNameColumn +
            rowIndex,
        );
      }

      const active_rule: boolean | undefined = sheet.getCellByA1(
        this.dashboardCondition.scriptCells.scriptsCells.activeRuleColumn + rowIndex,
      ).boolValue;
      if (active_rule == undefined) {
        throw Error(
          'Dashboard script configurator table with script: "active_rule" is missing on cell: ' +
            this.dashboardCondition.scriptCells.scriptsCells.scriptNameColumn +
            rowIndex,
        );
      }

      let priorityTicketOwnership: string | undefined = sheet.getCellByA1(
        this.dashboardCondition.scriptCells.scriptsCells.priorityTicketOwnershipColumn + rowIndex,
      ).stringValue;
      if (!priorityTicketOwnership) {
        throw Error(
          'Dashboard script configurator table with script: "priorityTicketOwnershipColumn" is missing on cell: ' +
            this.dashboardCondition.scriptCells.scriptsCells.scriptNameColumn +
            rowIndex,
        );
      }

      console.log("GetDashBoardAndConditions:scriptConditionStartParser: priorityTicketOwnership", priorityTicketOwnership);

      priorityTicketOwnership = priorityTicketOwnership.replace(/\s/g, "").replace(",", ";");

      console.log("GetDashBoardAndConditions:scriptConditionStartParser: priorityTicketOwnership after update", priorityTicketOwnership);
      const priorityTicketOwnershipArray = priorityTicketOwnership.split(";");
      console.log("GetDashBoardAndConditions:scriptConditionStartParser: priorityTicketOwnershipArray", priorityTicketOwnershipArray);

      if (priorityTicketOwnershipArray == null || priorityTicketOwnershipArray.length == 0) {
        throw Error(
          "Dashboard script configurator table with script: priorityTicketOwnershipArray is missing on cell: " +
            this.dashboardCondition.scriptCells.scriptsCells.priorityTicketOwnershipColumn +
            rowIndex,
        );
      }

      if (script_name) {
        GetDashboardAndConditionsService.dashboardsConfigs.searchConditions[script_name] = {
          script_name: script_name as SearchScripts,
          kpi_policy: kpi_policy as EnuKPI,
          active_rule: active_rule,
          policy_description: policy_description,
          who_will_be_responsible_description: who_will_be_responsible_description,
          how_to_fix_description: how_to_fix_description,
          jql_query: jql_query,
          priorityTicketOwnership: priorityTicketOwnershipArray,
        };
      }
    }

    console.log(
      "GetDashBoardAndConditions: scriptConditionStartParser returning conditions",
      Object.keys(GetDashboardAndConditionsService.dashboardsConfigs.searchConditions).length,
    );
  }

  private async findTableIndexesForScriptConditions(
    spreadSheet: SpreadSheetWorkSheet,
    scriptStart: string,
    scriptEnd: string,
  ): Promise<FindTableIndexesForScriptConditionsResult> {
    console.log("GetDashBoardAndConditions:findTableIndexesForScriptConditions: loadCells");
    await spreadSheet.sheet.loadCells("A1:AZ30000"); // loads range of cells into local cache - DOES NOT RETURN THE CELLS
    const rows = await spreadSheet.sheet.getRows({ offset: 0 }); // can pass in { limit, offset }

    let indexForSearchConditionsStart: number | null = null; // Where we're starting to get Script conditions
    let indexForSearchConditionsEnd: number | null = null; // Where we're ending to get Script conditions

    for (const row of rows) {
      // this mark: "scriptStart" is in worksheet in white color as invisible flag for this script
      if (spreadSheet.sheet.getCellByA1("A" + row.rowNumber).stringValue == scriptStart) {
        console.log("GetDashBoardAndConditions:findTableIndexesForScriptConditions: rulesForScriptStart row: " + (row.rowNumber + 2));
        indexForSearchConditionsStart = row.rowNumber;
      }

      // this mark: "scriptEnd" is in worksheet in white color as invisible flag for this script
      if (spreadSheet.sheet.getCellByA1("A" + row.rowNumber).stringValue == scriptEnd) {
        console.log("GetDashBoardAndConditions:findTableIndexesForScriptConditions: rulesForScriptEnd row: " + row.rowNumber);
        indexForSearchConditionsEnd = row.rowNumber;
        break;
      }
    }

    if (indexForSearchConditionsStart == null || indexForSearchConditionsEnd == null) {
      console.log('indexForSearchConditionsStart or indexForSearchConditionsEnd is null"');
      throw new Error("indexForSearchConditionsStart or indexForSearchConditionsEnd is null");
    }

    return {
      indexForSearchConditionsStart: indexForSearchConditionsStart,
      indexForSearchConditionsEnd: indexForSearchConditionsEnd,
    };
  }
}
