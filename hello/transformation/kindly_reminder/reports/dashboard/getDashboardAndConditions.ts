import {
    DashBoardQRProjectOverridesCellIndexes,
    DashboardsConfigs, EnuKPI,
    MandatoryEpicDesignationFieldsCellIndexes,
    SearchConditionsCellIndexes, SearchScripts
} from "./_models";
import {
    kindlyReminder_dashboardWorkSheetId,
    kindlyReminder_spreadSheetId,
    KindlyReminderConfigApp
} from "../../encore.service";
import {SpreadSheetWorkSheet} from "../../../../_libraries/3partyApis/googleDocs/models/config";

/**
 * Intended for extracting rules from the initial worksheet.
 * First, we find the keyword "programmatic::rulesForScriptStar" (In the document, it is white, so no one can see it)
 * and then we find "programmatic::rulesForScriptEnd". Everything in between is content for our script.
 */
export class GetDashBoardAndConditions {

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
    constructor () {}

    // -- Public methods  -----------------------------------------------------------------------------------------------
    public getSearchConditions(): Promise<DashboardsConfigs> {
        console.log("GetDashBoardAndConditions:getSearchConditions: init ===============================================");

        if (GetDashBoardAndConditions.dashboardsConfigs) {

            console.log("GetDashBoardAndConditions:getSearchConditions: already have searchConditions, return immediately");

            return new Promise((resolve, reject): void => {
                resolve(
                    GetDashBoardAndConditions.dashboardsConfigs
                );
            });

        } else {
            return new Promise( async (resolve, reject): Promise<void> => {

                const result = await this.configApp
                    .googleServices
                    .spreadsheet
                    .getSpreadsheetWithWorksheet(kindlyReminder_spreadSheetId, kindlyReminder_dashboardWorkSheetId);

                GetDashBoardAndConditions.dashboardsConfigs = {
                    searchConditions: {},
                    projectOverride: {},
                    mandatoryEpicDesignationFields: {
                        ktloProjects: [],
                        featureProjects: []
                    }
                };

                await this.findTableIndexesForScriptConditions(result, this.scriptConditionStart, this.scriptConditionEnd)
                    .then((indexes) => {

                        // Offset correction
                        indexes.indexForSearchConditionsEnd = indexes.indexForSearchConditionsEnd - 1;
                        indexes.indexForSearchConditionsStart = indexes.indexForSearchConditionsStart + 2;

                        for (let rowIndex = indexes.indexForSearchConditionsStart; rowIndex <= indexes.indexForSearchConditionsEnd; rowIndex++) {

                            const searchCondition: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.scriptCells.scriptsCells.scriptNameColumn + rowIndex).stringValue;

                            const script_name: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.scriptCells.scriptsCells.scriptNameColumn + rowIndex).stringValue;
                            if(!script_name) {
                                throw Error("script_name is missing");
                            }

                            const kpi_policy: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.scriptCells.scriptsCells.kpiPolicyColumn + rowIndex).stringValue;
                            if(!kpi_policy) {
                                throw Error("kpi_policy is missing");
                            }

                            const policy_description: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.scriptCells.scriptsCells.policyDescriptionColumn + rowIndex).stringValue;
                            if(!policy_description) {
                                throw Error("policy_description is missing");
                            }

                            const who_will_be_responsible_description: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.scriptCells.scriptsCells.whoWillBeResponsibleDescriptionColumn + rowIndex).stringValue;
                            if(!who_will_be_responsible_description) {
                                throw Error("who_will_be_responsible_description is missing");
                            }

                            const how_to_fix_description: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.scriptCells.scriptsCells.howToFixDescriptionColumn + rowIndex).stringValue;
                            if(!how_to_fix_description) {
                                throw Error("how_to_fix_description is missing");
                            }

                            const jql_query: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.scriptCells.scriptsCells.jqlQueryColumn + rowIndex).stringValue;
                            if(!jql_query) {
                                throw Error("jql_query is missing");
                            }

                            const active_rule: boolean | undefined = result.sheet.getCellByA1(this.dashboardCondition.scriptCells.scriptsCells.activeRuleColumn + rowIndex).boolValue;
                            if(active_rule == undefined) {
                                throw Error("active_rule is missing");
                            }

                            const priorityTicketOwnership: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.scriptCells.scriptsCells.priorityTicketOwnershipColumn + rowIndex).stringValue;
                            if(!priorityTicketOwnership) {
                                throw Error("priorityTicketOwnershipColumn is missing");
                            }

                            const priorityTicketOwnershipArray = priorityTicketOwnership
                                .replace(/\s/g, '')
                                .replace(',', ';')
                                .split(";")

                            if (priorityTicketOwnershipArray && priorityTicketOwnershipArray.length > 0) {
                                throw Error("priorityTicketOwnershipArray is missing");
                            }

                            if (searchCondition) {
                                GetDashBoardAndConditions
                                    .dashboardsConfigs
                                    .searchConditions[searchCondition] = {
                                    script_name: script_name as SearchScripts,
                                    kpi_policy: kpi_policy as EnuKPI ,
                                    active_rule: active_rule,
                                    policy_description: policy_description,
                                    who_will_be_responsible_description: who_will_be_responsible_description,
                                    how_to_fix_description: how_to_fix_description,
                                    jql_query: jql_query,
                                    priorityTicketOwnership: priorityTicketOwnershipArray
                                }
                            }

                        }

                        console.log("getSearchConditions: returning conditions", Object.keys( GetDashBoardAndConditions.dashboardsConfigs.searchConditions).length);
                    });

                await this.findTableIndexesForScriptConditions(result, this.qrProjectOverridesStart, this.qrProjectOverridesEnd)
                    .then((indexes) => {

                        // Offset correction
                        indexes.indexForSearchConditionsEnd = indexes.indexForSearchConditionsEnd - 1;
                        indexes.indexForSearchConditionsStart = indexes.indexForSearchConditionsStart + 3;

                        for (let rowIndex = indexes.indexForSearchConditionsStart; rowIndex <= indexes.indexForSearchConditionsEnd; rowIndex++) {

                            const ticket: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.qrOverridesCells.overridesCells.ticketColumn + rowIndex).stringValue;
                            if(!ticket) {
                                throw Error("ticketColumn is missing");
                            }

                            const vp_name: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.qrOverridesCells.overridesCells.vpEmailColum + rowIndex).stringValue;
                            if(!vp_name) {
                                throw Error("vp_name is missing");
                            }

                            const vp_email: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.qrOverridesCells.overridesCells.vpEmailColum + rowIndex).stringValue;
                            if(!vp_email) {
                                throw Error("vp_email is missing");
                            }

                            const project_owner_name: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.qrOverridesCells.overridesCells.projectOwnerNameColumn + rowIndex).stringValue;
                            if(!project_owner_name) {
                                throw Error("project_owner_name is missing");
                            }

                            const project_owner_email: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.qrOverridesCells.overridesCells.projectOwnerEmailColumn + rowIndex).stringValue;
                            if(!project_owner_email) {
                                throw Error("project_owner_email is missing");
                            }

                            GetDashBoardAndConditions.dashboardsConfigs.projectOverride[ticket] = {
                                vp_name:                vp_name,
                                vp_email:               vp_email,
                                project_owner_name:     project_owner_name,
                                project_owner_email:    project_owner_email,
                            }
                        }
                        console.log("getQRProjectOVerrideConditions: returning conditions", Object.keys(GetDashBoardAndConditions.dashboardsConfigs.projectOverride).length);
                    });

                await this.findTableIndexesForScriptConditions(result, this.mandatoryEpicDesignationStart, this.mandatoryEpicDesignationEnd)
                    .then(async (indexes) => {

                        // Offset correction
                        indexes.indexForSearchConditionsEnd = indexes.indexForSearchConditionsEnd - 1;
                        indexes.indexForSearchConditionsStart = indexes.indexForSearchConditionsStart + 2;

                        let ktloProjectsString: string | undefined = result.sheet.getCellByA1(this.dashboardCondition.epicMandatoryDesignation.scriptsCells.projectListColumn + indexes.indexForSearchConditionsStart).stringValue
                        if(!ktloProjectsString) {
                            throw Error("ktloProjectsString is missing");
                        }

                        let featureProjectsString: string | undefined  = result.sheet.getCellByA1(this.dashboardCondition.epicMandatoryDesignation.scriptsCells.projectListColumn + indexes.indexForSearchConditionsEnd).stringValue
                        if(!featureProjectsString) {
                            throw Error("featureProjectsString is missing");
                        }


                        ktloProjectsString = ktloProjectsString.replace(/\s/g, '');
                        featureProjectsString = featureProjectsString.replace(/\s/g, '');

                        await this.configApp.jiraServices.project.getAllProjects( {orderBy: "name", status: ["live"] })
                            .then((findedProjects) => {

                                console.log("Checking - projects from JIRA:", findedProjects.length);

                                const ktloListFiltered: string[] = [];

                                ktloProjectsString.split(";").forEach((prjKeyUnChecked) => {
                                    if (findedProjects.find((pr) => pr.key === prjKeyUnChecked && pr.archived != true )) {
                                        ktloListFiltered.push(prjKeyUnChecked);
                                    } else {
                                        console.log("ktlo:Checking Excluded project:", prjKeyUnChecked);

                                    }
                                });

                                const featureListFiltered: string[] = [];

                                featureProjectsString.split(";").forEach((prjKeyUnChecked) => {
                                    if (findedProjects.find((pr) => pr.key === prjKeyUnChecked && pr.archived != true )) {
                                        featureListFiltered.push(prjKeyUnChecked);
                                    } else {
                                        console.log("feature:Checking Excluded project:", prjKeyUnChecked);
                                    }
                                });

                                GetDashBoardAndConditions.dashboardsConfigs.mandatoryEpicDesignationFields = {
                                    ktloProjects: ktloListFiltered,
                                    featureProjects: featureListFiltered
                                }

                            })




                        console.log("getMandatoryEpicDesignationFields: returning conditions", Object.keys(GetDashBoardAndConditions.dashboardsConfigs.mandatoryEpicDesignationFields).length);
                    });

                resolve(GetDashBoardAndConditions.dashboardsConfigs);

            });
        }
    }

    // --- Helpers -----------------------------------------------------------------------------------------------------

    private findTableIndexesForScriptConditions(spreadSheet: SpreadSheetWorkSheet, scriptStart: string, scriptEnd: string): Promise<{
        indexForSearchConditionsStart: number,
        indexForSearchConditionsEnd: number
    }> {
        return new Promise(async (resolve, reject) => {
            console.log("GetDashBoardAndConditions:findTableIndexes: loadCells");
            await spreadSheet.sheet.loadCells('A1:AZ30000'); // loads range of cells into local cache - DOES NOT RETURN THE CELLS
            const rows = await spreadSheet.sheet.getRows({offset: 0}); // can pass in { limit, offset }

            let indexForSearchConditionsStart: number | null = null; // Where we're starting to get Script conditions
            let indexForSearchConditionsEnd: number | null = null; // Where we're ending to get Script conditions

            for (const row of rows) {

                // this mark: "scriptStart" is in worksheet in white color as invisible flag for this script
                if (spreadSheet.sheet.getCellByA1("A" + row.rowNumber).stringValue == scriptStart) {
                    console.log("GetDashBoardAndConditions:findTableIndexes: rulesForScriptStart row: " + (row.rowNumber + 2));
                    indexForSearchConditionsStart = row.rowNumber;
                }

                // this mark: "scriptEnd" is in worksheet in white color as invisible flag for this script
                if (spreadSheet.sheet.getCellByA1("A" + row.rowNumber).stringValue == scriptEnd) {
                    console.log("GetDashBoardAndConditions:findTableIndexes: rulesForScriptEnd row: " + row.rowNumber);
                    indexForSearchConditionsEnd = row.rowNumber;
                    break;
                }
            }

            if (indexForSearchConditionsStart == null || indexForSearchConditionsEnd == null ) {
                throw new Error("indexForSearchConditionsStart or indexForSearchConditionsEnd is null");
            }

            resolve (
                {
                    indexForSearchConditionsStart: indexForSearchConditionsStart,
                    indexForSearchConditionsEnd: indexForSearchConditionsEnd
                }
            );
        });
    }




}

