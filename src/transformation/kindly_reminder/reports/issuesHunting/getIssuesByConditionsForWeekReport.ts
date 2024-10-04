import {Issue} from "jira.js/src/version3/models/issue";
import {Project} from "jira.js/src/version3/models/project";
import moment from "moment/moment.js";
import {GetDashBoardAndConditions,} from "../dashboard/getDashboardAndConditions";
import {PrintIssuesIntoWorksheet} from "../getIssues/printIssuesIntoWorksheet";
import {DashboardsConfigs, SearchCondition, SearchScripts} from "../dashboard/_models";
import {ConvertedAndAgregatedHoursByIssue} from "../issuesPrint/_models";
import {KindlyReminderConfigApp} from "../../encore.service";
import {IssueProjectStructure, JQLProjectQueries, ProjectStructure} from "./_models";
import {ExtendedIssue} from "../../../../_libraries/3partyApis/jira/models/jira_extededIssue";
import {WorkLog} from "../../../../_libraries/3partyApis/tempo/models/tempo_workLogsResponse";


export class GetIssuesByConditionsForWeekReport {

    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();
    private readonly doneStates: string[] = ["Done", "Won't do it", "Won’t do"];

    // -- Constructor  -------------------------------------------------------------------------------------------------
    constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------
    public getProjectIssuesAndPrint(projectKey: string, activeWeekNumber: number): Promise<IssueProjectStructure>  {
        return new Promise( async (resolve, reject) => {

            console.log("------------------------------------------------------------------");
            console.log("GetIssuesByConditionsForWeekReport:getProjectIssuesAndPrint - start");
            console.log("Project:", projectKey)

            // Report conditions
            new GetDashBoardAndConditions()
                .getSearchConditions()
                .then(async (dashboardsConfigs) => {

                    // Right Issue Worksheet


                    const issueProjectStructure: IssueProjectStructure = {};
                    const project = await this.configApp.jiraServices.project.getProject({projectIdOrKey:  projectKey});

                    if (project != null) {

                        await this.getProjectIssues(project, activeWeekNumber, dashboardsConfigs)
                            .then((projectStructure: ProjectStructure) => {
                                console.log("Project", project.name, "all issues done");
                                issueProjectStructure[projectKey] = projectStructure;
                                return projectStructure
                            })
                            .then((projectStructure) => {
                                return new PrintIssuesIntoWorksheet()
                                    .printIssuesIntoActiveWeekSheet(
                                        projectStructure,
                                        activeWeekNumber
                                    );
                            })
                            .then(() => {
                                resolve(issueProjectStructure);
                            })
                    }

                })
        });
    }


    // Common Project Issues
    public getProjectIssues(project: Project, activeWeekNumber: number, dashboardsConfigs: DashboardsConfigs): Promise<ProjectStructure>  {
        return new Promise( async (resolve, reject) => {

            const queries: JQLProjectQueries = new JQLProjectQueries(project.key);
            const projectStructure: ProjectStructure = {
                issues: {}
            };

            // Epic without parent
            if (dashboardsConfigs.searchConditions[SearchScripts.epicWithoutParent]
                && project.key != "QR"
                && project.key != "ADMIN"
                &&  dashboardsConfigs.searchConditions[SearchScripts.epicWithoutParent].active_rule) {
                for (const ticket of await this.getEpicsWithoutParent(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.epicWithoutParent], ticket);
                }
            }

            // Epic without owner
            if (dashboardsConfigs.searchConditions[SearchScripts.epicWithoutOwner]
                && project.key != "QR"
                && project.key != "ADMIN"
                &&  dashboardsConfigs.searchConditions[SearchScripts.epicWithoutOwner].active_rule) {
                for (const ticket of await this.getEpicsWithoutOwner(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.epicWithoutOwner], ticket);
                }
            }

            // Epic without field (Epic Designation)
            if (dashboardsConfigs.searchConditions[SearchScripts.epicWithoutDesignation]
                && project.key != "QR"
                && project.key != "ADMIN"
                &&  dashboardsConfigs.searchConditions[SearchScripts.epicWithoutDesignation].active_rule) {
                for (const ticket of await this.getEpicWithoutProperFieldEpicDesignation(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.epicWithoutDesignation], ticket);
                }
            }

            // Initiative without Parent
            if (dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutParent]
                && project.key != "QR"
                && project.key != "ADMIN"
                && dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutParent].active_rule) {
                for (const ticket of await this.getInitiativesTicketsWithoutParent(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutParent], ticket);
                }
            }

            //  Initiative without owner
            if (dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutOwner]
                && project.key == "QR"
                && dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutOwner].active_rule) {
                for (const ticket of await this.getInitiativesWithoutOwner(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutOwner], ticket);
                }
            }

            //  Initiative without Quartals labels
            if (dashboardsConfigs.searchConditions[SearchScripts.initiativeQRLabels]
                && project.key == "QR"
                && dashboardsConfigs.searchConditions[SearchScripts.initiativeQRLabels].active_rule) {
                for (const ticket of await this.getInitiativesWithoutQuarterLabels(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.initiativeQRLabels], ticket);
                }
            }

            //  Initiative without field (Initiative category)
            if (dashboardsConfigs.searchConditions[SearchScripts.initiativeQRFieldIC]
                && project.key == "QR"
                && dashboardsConfigs.searchConditions[SearchScripts.initiativeQRFieldIC].active_rule) {
                for (const ticket of await this.getInitiativesWithoutProperField(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.initiativeQRFieldIC], ticket);
                }
            }

            //  Initiative without field (Original Estimate (Eng) & Original Estimate (Prd))
            if (dashboardsConfigs.searchConditions[SearchScripts.originalEstimateInitiative]
                && project.key == "QR"
                && dashboardsConfigs.searchConditions[SearchScripts.originalEstimateInitiative].active_rule) {
                for (const ticket of await this.getInitiativesWithoutProperOriginalEstimate(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.originalEstimateInitiative], ticket);
                }
            }

            //  Initiative without field (Initiative - Financial Description)
            if (dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutFinancialDescription]
                && project.key == "QR"
                && dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutFinancialDescription].active_rule) {
                for (const ticket of await this.getInitiativesWithoutFinancialDescription(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutFinancialDescription], ticket);
                }
            }

            //  Initiative without field (Initiative - Customer Facing)
            if (dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutFinancialCFacing]
                && project.key == "QR"
                && dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutFinancialCFacing].active_rule) {
                for (const ticket of await this.getInitiativesWithoutCustomerFacing(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.initiativeWithoutFinancialCFacing], ticket);
                }
            }


            // theme without Owner
            if (dashboardsConfigs.searchConditions[SearchScripts.themeWithoutOwner]
                && project.key == "QR"
                && dashboardsConfigs.searchConditions[SearchScripts.themeWithoutOwner].active_rule) {
                for (const ticket of await this.getThemeWithoutOwner(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.themeWithoutOwner], ticket);
                }
            }

            // theme without field (Strategic Objectives)
            if (dashboardsConfigs.searchConditions[SearchScripts.themeQRFieldSO]
                && project.key == "QR"
                && dashboardsConfigs.searchConditions[SearchScripts.themeQRFieldSO].active_rule) {
                for (const ticket of await this.getThemeWithoutProperField(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.themeQRFieldSO], ticket);
                }
            }

            // Tempo tickets without parents
            if (dashboardsConfigs.searchConditions[SearchScripts.tickWithTempoNoParent]
                && project.key != "QR"
                && project.key != "ADMIN"
                && dashboardsConfigs.searchConditions[SearchScripts.tickWithTempoNoParent].active_rule) {
                const getTEMPO_logsX = await this.getTEMPOlogsX(project, activeWeekNumber);
                for (const ticket of getTEMPO_logsX.issues) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.tickWithTempoNoParent], ticket);
                    projectStructure.issues[ticket.key].loggedHoursInQ += getTEMPO_logsX.convertorBetweenIdAndKey[ticket.id].loggedHoursInQ;
                }
            }

            // Sprint ticket without owner
            if (dashboardsConfigs.searchConditions[SearchScripts.sprintTicketOwner]
                && project.key != "QR"
                && project.key != "ADMIN"
                &&  dashboardsConfigs.searchConditions[SearchScripts.sprintTicketOwner].active_rule) {
                for (const ticket of await this.getSprintTicketsWithoutOwner(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.sprintTicketOwner], ticket);
                }
            }

            // Sprint ticket without Original Estimate
            if (dashboardsConfigs.searchConditions[SearchScripts.originalEstimateTicket]
                && project.key != "QR"
                && project.key != "ADMIN"
                && project.key != "RE"
                &&  dashboardsConfigs.searchConditions[SearchScripts.originalEstimateTicket].active_rule) {
                for (const ticket of await this.getSprintTicketsWithoutOriginalEstimate(queries)) {
                    this.addToStructure(projectStructure, dashboardsConfigs.searchConditions[SearchScripts.originalEstimateTicket], ticket);
                }
            }

            console.log("------------------------------------------------------------------");
            console.log("Save issues into SpreadSheets - Projects")
            resolve(projectStructure);

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


    // *** Get Issues --------------------------------------------------------------------------------------------------

    // epicWithoutParent
    private getEpicsWithoutParent(queries: JQLProjectQueries): Promise<Issue[]> {
        return this.configApp.jiraServices.issue.getAllIssues({
            jql: queries.findAllEpicTicketsWithoutParent
        });
    }


    private getInitiativesTicketsWithoutParent(queries: JQLProjectQueries): Promise<Issue[]> {
        return this.configApp.jiraServices.issue.getAllIssues({
            jql: queries.findAllInitiativesTicketsWithoutParent
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
            jql: queries.findAllThemesTicketsWithoutOwner
        });
    }


    private getSprintTicketsWithoutOwner(queries: JQLProjectQueries): Promise<Issue[]> {
        return this.configApp.jiraServices.issue.getAllIssues({
            jql: queries.findSprintTicketsWithoutOwner
        });
    }


    private getEpicsWithoutOwner(queries: JQLProjectQueries): Promise<Issue[]> {
        return this.configApp.jiraServices.issue.getAllIssues({
            jql: queries.findAllEpicTicketsWithoutOwner
        });
    }

    private getInitiativesWithoutOwner(queries: JQLProjectQueries): Promise<Issue[]> {
        return this.configApp.jiraServices.issue.getAllIssues({
            jql: queries.findAllInitiativeTicketsWithoutOwner
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
            jql: queries.findAllInitiativeWithoutLabels
        });
    }

    public getInitiativesWithoutQuarterLabels_validation(ticket: Issue): string {
        if (ticket == null) {
            return "REMOVED";
        } else {
            const extendedTicket = new ExtendedIssue(ticket);

            if (extendedTicket.status == "done") {
                return "DONE";
            }

            if (extendedTicket.labels.includes("24Q3")
                || extendedTicket.labels.includes("24Q4")
                || extendedTicket.labels.includes("25QQ")
            ) {
                console.log("     contians Q3 label or newer");

                return "DONE";
            }


            if (extendedTicket.quartalTags.length > 0) {

                console.log("     QR label Check:", ticket.key, "status", extendedTicket.status , "parent", extendedTicket.parent ? extendedTicket.parent.issueKey: "No parent", "Labels:", extendedTicket.labels);

                if (!extendedTicket.labels.includes("24Q3") &&
                    extendedTicket.parent &&
                    extendedTicket.parent.issueKey == "QR-111" ) {

                    console.log("      - We have KTLO Initaitive");

                    if (extendedTicket.summary.includes("Permanent")) {
                        this.configApp.jiraServices.issue.updateIssue({
                            issueIdOrKey: ticket.key,
                            returnIssue: true,
                            update: {
                                "labels": [
                                    {
                                        "add": "KTLO"
                                    },
                                    {
                                        "add": "24Q3"
                                    }
                                ]
                            },
                        }).then((resultIssue) => {
                        })
                    }
                }

                if(extendedTicket.parent && extendedTicket.parent.issueKey != "QR-111" ) {
                    if( extendedTicket.quartalTags.includes("24Q2")
                        && !extendedTicket.quartalTags.includes("24Q3")
                        && !extendedTicket.quartalTags.includes("spillover")
                        && extendedTicket.status == "In Progress") {
                        console.log("  QR label contains 24Q2 but it spillover and status is in progress ", ticket.key)

                        this.configApp.jiraServices.issue.updateIssue({
                            issueIdOrKey: ticket.key,
                            returnIssue: true,
                            update: {
                                "labels": [
                                    {
                                        "add": "spillover"
                                    },
                                    {
                                        "add": "24Q3"
                                    }
                                ]
                            },
                        }).then((resultIssue) => {
                        })

                        return "TODO";
                    }
                }



                return "DONE";
            } else {
                console.log("  No labels for:", ticket.key)


                return "TODO";
            }
        }
    }

    // Field initiative category ------------------------------------------------------------------------------------------------
    private getInitiativesWithoutProperField(queries: JQLProjectQueries): Promise<Issue[]> {
        return this.configApp.jiraServices.issue.getAllIssues({
            jql: queries.findAllInitiativeWithoutProperField
        });
    }

    public getInitiativesWithoutProperField_validation(ticket: Issue): string {

        if (ticket == null) {
            return "REMOVED";
        } else {
            const extendedTicket = new ExtendedIssue(ticket);
            if (extendedTicket.fields['customfield_22036'] != null && extendedTicket.fields['customfield_22036'].value) {
                return "DONE";
            } else {
                return "TODO";
            }
        }

    }

    // Field Original Estimate ------------------------------------------------------------------------------------------------
    private getInitiativesWithoutProperOriginalEstimate(queries: JQLProjectQueries): Promise<Issue[]> {
        return this.configApp.jiraServices.issue.getAllIssues({
            jql: queries.findAllInitiativeWithoutOriginalEstimate
        });
    }

    public getInitiativesWithoutOriginalEstimate_validation(ticket: Issue): string {
        if (ticket == null) {
            return "REMOVED";
        } else {
            const extendedTicket = new ExtendedIssue(ticket);
            if(this.doneStates.includes(extendedTicket.status )) {
                return "DONE";
            } else if (
                (extendedTicket.fields['customfield_22047'] != null && extendedTicket.fields['customfield_22047'].value != "")
                ||
                ( extendedTicket.fields['customfield_22048'] != null && extendedTicket.fields['customfield_22048'].value != "")
            ) {
                return "DONE";
            } else {
                return "TODO";
            }
        }
    }

    // Field Original Estimate ------------------------------------------------------------------------------------------------
    private getInitiativesWithoutFinancialDescription(queries: JQLProjectQueries): Promise<Issue[]> {
        return this.configApp.jiraServices.issue.getAllIssues({
            jql: queries.findAllInitiativeWithoutFinancialDescription
        });
    }

    public getInitiativesWithoutFinancialDescription_validation(ticket: Issue): string {
        if (ticket == null) {
            return "REMOVED";
        } else {
            const extendedTicket = new ExtendedIssue(ticket);

            if (extendedTicket.fields['customfield_22184'] != null) {
                if (extendedTicket.fields['customfield_22184']['content'] != null) {

                    let sumContent: string = "";
                    for (const paragraph of extendedTicket.fields['customfield_22184']['content'] ) {
                        if (paragraph["type"] == "paragraph") {
                            for(const cnt of paragraph["content"] ) {
                                if (cnt["text"]) {
                                    sumContent = sumContent +cnt["text"]
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
            jql: queries.findAllInitiativeWithoutCustomerFacing
        });
    }

    public getInitiativesWithoutCustomerFacing_validation(ticket: Issue): string {
        if (ticket == null) {
            return "REMOVED";
        } else {
            const extendedTicket = new ExtendedIssue(ticket);
            if (
                (extendedTicket.fields['customfield_22185'] != null && extendedTicket.fields['customfield_22185'].value != "")
                ||
                ( extendedTicket.fields['customfield_22185'] != null && extendedTicket.fields['customfield_22185'].value != "")
            ) {
                return "DONE";
            } else {
                return "TODO";
            }
        }
    }



    private getEpicWithoutProperFieldEpicDesignation(queries: JQLProjectQueries): Promise<Issue[]> {
        return this.configApp.jiraServices.issue.getAllIssues({
            jql: queries.findAllEpicsWithoutProperFieldEpicDesignation
        });
    }

    public getEpicWithoutProperFieldEpicDesignation_validation(ticket: Issue): string {
        if (ticket == null) {
            return "REMOVED";
        } else {
            const extendedTicket = new ExtendedIssue(ticket);

            if(this.doneStates.includes(extendedTicket.status )) {
                return "DONE";
            } else if (extendedTicket.fields['customfield_22035'] != null && extendedTicket.fields['customfield_22035'].value) {
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
            if (extendedTicket.fields['customfield_22035'] != null && extendedTicket.fields['customfield_22035'].value == "KTLO") {
                return "DONE";
            } else {
                return "TODO";
            }
        }
    }


    private getThemeWithoutProperField(queries: JQLProjectQueries): Promise<Issue[]> {
        return this.configApp.jiraServices.issue.getAllIssues({
            jql: queries.findAllThemesWithoutProperField
        });
    }

    public getThemeWithoutProperField_validation(ticket: Issue): string {
        if (ticket == null) {
            return "REMOVED";
        } else {
            const extendedTicket = new ExtendedIssue(ticket);
            if (extendedTicket.fields['customfield_22046'] != null && extendedTicket.fields['customfield_22046'].value) {
                return "DONE";
            } else {
                return "TODO";
            }
        }
    }


    // Original Estimate -------------------------------------------------------------------------------------

    private getSprintTicketsWithoutOriginalEstimate(queries: JQLProjectQueries): Promise<Issue[]> {
        return this.configApp.jiraServices.issue.getAllIssues({
            jql: queries.findSprintTicketsWithoutOriginalEstimate
        });
    }

    // Tempo -------------------------------------------------------------------------------------


    private getTEMPOlogsX(project: Project, activeWeekNumber: number): Promise<{convertorBetweenIdAndKey: ConvertedAndAgregatedHoursByIssue, issues: Issue[]}>  {
        return this.getTEMPOlogs(Number(project.id), project.key, activeWeekNumber)
            .then(async (response) => {
                for (let ticket of response.issues) {
                    console.log("     Ticket: ", ticket.key, "we are interesting in number of child issues -------------");
                    await this.configApp.jiraServices.issue.getAllChildIssues(ticket.key)
                        .then(async (childIssues) => {


                            console.log("           : number of child issues:", childIssues.issues.length);

                            let totalSump: number = 0;
                            for (let childIssue of childIssues.issues) {
                                if (response.convertorBetweenIdAndKey[childIssue.id]) {
                                    console.log("           : Child issue", childIssue.key, " exist in convertor with all hours:", response.convertorBetweenIdAndKey[childIssue.id].loggedHoursInQ);
                                    totalSump += response.convertorBetweenIdAndKey[childIssue.id].loggedHoursInQ;
                                } else {
                                    console.log("           : Child issue", childIssue.key, " not Exist in Convertor");
                                }
                            }
                            response.convertorBetweenIdAndKey[ticket.id].loggedHoursInQ += totalSump;

                        });
                }
                return response;
            });
    }


    private getTEMPOlogs(projectID: number, projectKey: string, activeWeekNumber: number): Promise<{convertorBetweenIdAndKey: ConvertedAndAgregatedHoursByIssue, issues: Issue[], logs: WorkLog[]}> {
        return this.configApp.tempoService.getUsersWorkLogs(
            {
                projectId: projectID,
                from: moment().quarter( moment().quarter() ).startOf('quarter').subtract( 1, 'month').format('YYYY-MM-DD'),
                to: moment().quarter( moment().quarter() ).endOf('quarter').format('YYYY-MM-DD'),
            }
        )
            .then((result) => {

                let convertorBetweenIdAndKey: ConvertedAndAgregatedHoursByIssue = {};

                result.forEach((log) => {
                    if(log.issue) {
                        if (!convertorBetweenIdAndKey[log.issue.id]) {
                            convertorBetweenIdAndKey[log.issue.id] = {
                                loggedHoursInQ: log.timeSpentSeconds ?? 0
                            }
                        } else {
                            convertorBetweenIdAndKey[log.issue.id].loggedHoursInQ += ( log.timeSpentSeconds ?? 0);
                        }
                    }

                });

                return this.configApp.jiraServices.issue.getUnparentedJiraTicketsLogsByTempo(projectKey, result)
                    .then((resultIssues) => {

                        resultIssues.forEach((issue) => {

                        });



                        return {
                            convertorBetweenIdAndKey: convertorBetweenIdAndKey,
                            issues: resultIssues,
                            logs: result
                        }
                    });

            });
    }
}
