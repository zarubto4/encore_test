import {Issue} from "jira.js/src/version3/models/issue";
import {GetDashBoardAndConditions} from "../dashboard/getDashboardAndConditions";
import {PrintIssuesIntoWorksheet} from "../getIssues/printIssuesIntoWorksheet";
import {EnuKPI, SearchCondition, SearchScripts} from "../dashboard/_models";
import {replaceKeys} from "../../../../_libraries/core/parsing_and_formating/stringInject";
import {JQLProjectQueriesAutomation, ProjectStructure} from "./_models";
import {KindlyReminderConfigApp} from "../../encore.service";



export class GetFixableIssuesByAutomation {

    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();

    // -- Constructor  -------------------------------------------------------------------------------------------------
    constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------
    public getAndFixAllCapLabourIssues(activeIssueWeek: number): Promise<ProjectStructure>  {

        return new Promise( async (resolve, reject) => {

            console.log("------------------------------------------------------------------");
            console.log("GetFixableIssuesByAutomation:getAndFixAllCapLabourIssues - start");

            // Report conditions
            new GetDashBoardAndConditions()
                .getSearchConditions()
                .then(async (dashboardsConfigs) => {

                    const queries = new JQLProjectQueriesAutomation();
                    const projectStructure: ProjectStructure = {
                        issues: {}
                    };

                    // Epics under KTLO QR-111
                    if (dashboardsConfigs.searchConditions[SearchScripts.ktloEpicsCheckLabel] && dashboardsConfigs.searchConditions[SearchScripts.ktloEpicsCheckLabel].active_rule) {
                        for (const ticket of await this.configApp.jiraServices.issue.getAllIssues({
                            jql: queries.findKTLOEpicsWithoutEpicDesignation
                        })) {
                            console.log("getAndFixAllCapLabourIssues: ktloEpicsCheckLabel - updating ticket", ticket.key);
                            await this.configApp.jiraServices.issue.updateIssue({
                                issueIdOrKey: ticket.key,
                                returnIssue: true,
                                notifyUsers: false,
                                fields: {
                                    "customfield_22035":  {
                                        "value" : "KTLO"
                                    }
                                    // 25126 Feature or 25127 as KTLO
                                }
                            }).then((resultIssue: Issue | null) => {
                                console.log("  ticket", ticket.key, 'updated');
                                try {
                                    this.addToStructure(projectStructure,
                                        dashboardsConfigs.searchConditions[SearchScripts.ktloEpicsCheckLabel],
                                        ticket);
                                } catch (Error) {
                                    console.error("getAndFixAllCapLabourIssues: ktloEpicsCheckLabel - addToStructure erros:", ticket.key, JSON.stringify(dashboardsConfigs.searchConditions));
                                    console.error("getAndFixAllCapLabourIssues: ktloEpicsCheckLabel - addToStructure erros:", ticket.key, "type", SearchScripts.ktloEpicsCheckLabel, "json:",
                                        (dashboardsConfigs.searchConditions[SearchScripts.ktloEpicsCheckLabel] ?
                                        JSON.stringify(dashboardsConfigs.searchConditions[SearchScripts.ktloEpicsCheckLabel]) : "Not available"));

                                }

                            }).catch((exception: any) => {
                                console.log("getAndFixAllCapLabourIssues: ktloEpicsCheckLabel - Update error for ticket:", ticket.key, JSON.stringify(dashboardsConfigs.searchConditions));
                                try{

                                    this.addToStructure(projectStructure, {
                                        script_name: SearchScripts.ktloEpicsCheckLabel,
                                        active_rule: true,
                                        kpi_policy: EnuKPI.Mandatory,
                                        policy_description: 'Every Epic ticket under KTLO Theme QR-111 must be set as KTLO on Field Epic Designation',
                                        how_to_fix_description: 'Set KTLO value in filed Epic Designation in this ticket',
                                        who_will_be_responsible_description: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].who_will_be_responsible_description,
                                        jql_query: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].jql_query,
                                        priorityTicketOwnership: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].priorityTicketOwnership,

                                    }, ticket);

                                } catch (error) {
                                    console.error("getAndFixAllCapLabourIssues: ktloEpicsCheckLabel - error:", dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck], error);

                                }

                            });
                        }
                    }

                    // No Epics with label Epic Designation
                    if (dashboardsConfigs.searchConditions[SearchScripts.nonEpicsWithEpicDesignation]  &&  dashboardsConfigs.searchConditions[SearchScripts.nonEpicsWithEpicDesignation].active_rule) {

                        for (const ticket of await this.configApp.jiraServices.issue.getAllIssues({
                            jql: queries.findNonEpicsWithEpicDesignation
                        })) {
                            console.log("getAndFixAllCapLabourIssues: nonEpicsWithEpicDesignation - updating ticket", ticket.key, JSON.stringify(dashboardsConfigs.searchConditions));
                            await this.configApp.jiraServices.issue.updateIssue({
                                issueIdOrKey: ticket.key,
                                returnIssue: true,
                                notifyUsers: false,
                                fields: {
                                    "customfield_22035": null
                                }
                            }).then((resultIssue) => {
                                console.log("  ticket", ticket.key, 'updated');
                                this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.nonEpicsWithEpicDesignation], ticket);
                            }).catch((exception) => {
                                console.log("getAndFixAllCapLabourIssues: nonEpicsWithEpicDesignation - Update error for ticket:", ticket.key);
                                try {
                                    this.addToStructure(projectStructure, {
                                        script_name: SearchScripts.nonEpicsWithEpicDesignation,
                                        active_rule: true,
                                        kpi_policy: EnuKPI.Mandatory,
                                        policy_description: 'Each non-epic ticket must not contain a completed Designation field Epic Designation. It must be Empty',
                                        how_to_fix_description: 'Remove KTLO or Feature value in filed Epic Designation in this ticket',
                                        who_will_be_responsible_description: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].who_will_be_responsible_description,
                                        jql_query: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].jql_query,
                                        priorityTicketOwnership: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].priorityTicketOwnership,

                                    }, ticket);
                                } catch (err) {
                                    console.log("getAndFixAllCapLabourIssues: nonEpicsWithEpicDesignation - error", dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck], err);
                                }

                            });

                        }
                    }

                    // Mandatory Epic Designation Fixed - KTLO or Feature by dashboard Config
                    if (dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck]  && dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].active_rule) {

                        if(dashboardsConfigs.mandatoryEpicDesignationFields.featureProjects.length > 0) {

                            let projectsFeatureForJira: string = ""
                            for( let i: number = 0; i < dashboardsConfigs.mandatoryEpicDesignationFields.featureProjects.length; i++ ) {
                                if((i + 1) < dashboardsConfigs.mandatoryEpicDesignationFields.featureProjects.length ) {
                                    projectsFeatureForJira = projectsFeatureForJira + dashboardsConfigs.mandatoryEpicDesignationFields.featureProjects[i] + ","
                                } else {
                                    projectsFeatureForJira = projectsFeatureForJira + dashboardsConfigs.mandatoryEpicDesignationFields.featureProjects[i]
                                }
                            }

                            for (const ticket of await this.configApp.jiraServices.issue.getAllIssues({
                                jql:  replaceKeys(queries.findAndFixAllNonHardlySetEpicDesignations, {
                                    type: 'Feature',
                                    projects: projectsFeatureForJira
                                })
                            })) {
                                console.log("getMandatoryFieldForEpicCheck: mandatoryFieldForEpicCheck - updating ticket", ticket.key);
                                await this.configApp.jiraServices.issue.updateIssue({
                                    issueIdOrKey: ticket.key,
                                    returnIssue: true,
                                    notifyUsers: false,
                                    fields: {
                                        "customfield_22035":  {
                                            "value" : "Feature"
                                        }
                                    }
                                }).then((resultIssue) => {
                                    console.log("  ticket", ticket.key, 'updated');
                                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck], ticket);
                                }).catch((exception) => {
                                    console.log("getMandatoryFieldForEpicCheck: mandatoryFieldForEpicCheck Feature: - Update error for ticket:", ticket.key);
                                    try {
                                        this.addToStructure(projectStructure, {
                                            script_name: SearchScripts.mandatoryFieldForEpicCheck,
                                            active_rule: true,
                                            kpi_policy: EnuKPI.Mandatory,
                                            policy_description: 'This Epic ticket in Field Epic Designation must be hardly set to FEATURE.',
                                            how_to_fix_description: 'Set FEATURE value in filed Epic Designation in this ticket',
                                            who_will_be_responsible_description: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].who_will_be_responsible_description,
                                            jql_query: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].jql_query,
                                            priorityTicketOwnership: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].priorityTicketOwnership,
                                        }, ticket);
                                    } catch (err) {
                                        console.error("getAndFixAllCapLabourIssues: nonEpicsWithEpicDesignation - error", dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck], err);

                                    }
                                });
                            }

                        }

                        if (dashboardsConfigs.mandatoryEpicDesignationFields.ktloProjects.length > 0) {

                            let projectsKTLOForJira: string = ""
                            for( let i: number = 0; i < dashboardsConfigs.mandatoryEpicDesignationFields.ktloProjects.length; i++ ) {
                                if((i + 1) < dashboardsConfigs.mandatoryEpicDesignationFields.ktloProjects.length ) {
                                    projectsKTLOForJira = projectsKTLOForJira + dashboardsConfigs.mandatoryEpicDesignationFields.ktloProjects[i] + ","
                                } else {
                                    projectsKTLOForJira = projectsKTLOForJira + dashboardsConfigs.mandatoryEpicDesignationFields.ktloProjects[i]
                                }
                            }

                            for (const ticket of await this.configApp.jiraServices.issue.getAllIssues({
                                jql: replaceKeys(queries.findAndFixAllNonHardlySetEpicDesignations, {
                                    type: 'KTLO',
                                    projects: projectsKTLOForJira
                                })
                            })) {
                                console.log("getmandatoryFieldForEpicCheck: mandatoryFieldForEpicCheck KTLO: - updating ticket", ticket.key);
                                await this.configApp.jiraServices.issue.updateIssue({
                                    issueIdOrKey: ticket.key,
                                    returnIssue: true,
                                    notifyUsers: false,
                                    fields: {
                                        "customfield_22035": {
                                            "value": "KTLO"
                                        }
                                    }
                                }).then((resultIssue) => {
                                    console.log("  ticket", ticket.key, 'updated');
                                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck], ticket);
                                }).catch((exception) => {
                                    console.log("getAndFixAllCapLabourIssues: nonEpicsWithEpicDesignation - Update error for ticket:", ticket.key);
                                    try {
                                        this.addToStructure(projectStructure, {
                                            script_name: SearchScripts.mandatoryFieldForEpicCheck,
                                            active_rule: true,
                                            kpi_policy: EnuKPI.Mandatory,
                                            policy_description: 'This Epic ticket in Field Epic Designation must be hardly set to KTLO.',
                                            how_to_fix_description: 'Set KTLO value in filed Epic Designation in this ticket',
                                            who_will_be_responsible_description: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].who_will_be_responsible_description,
                                            jql_query: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].jql_query,
                                            priorityTicketOwnership: dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck].priorityTicketOwnership,
                                        }, ticket);
                                    } catch (err) {
                                        console.log("getAndFixAllCapLabourIssues: nonEpicsWithEpicDesignation - error", dashboardsConfigs.searchConditions[SearchScripts.mandatoryFieldForEpicCheck], err);
                                    }

                                });
                            }
                        }
                    }

                    await new PrintIssuesIntoWorksheet()
                        .printIssuesIntoActiveWeekSheet(
                            projectStructure,
                            activeIssueWeek
                        );

                    resolve(projectStructure);

                });

        });
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
                }
            }
        } else if (!projectStructure.issues[ticket.key].ourIssues[ourIssue.script_name]) {
            console.log("      ", ticket.key, ":addToStructure: add to project as new");
            projectStructure.issues[ticket.key].ourIssues[ourIssue.script_name] = ourIssue;
        }
    }
}