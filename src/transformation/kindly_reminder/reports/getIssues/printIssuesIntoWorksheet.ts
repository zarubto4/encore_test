
import {GetDashBoardAndConditions,} from "../dashboard/getDashboardAndConditions";
import {GetPrintedIssuesList} from "./getPrintedIssues";
import {ProjectStage} from "../projectWorkSheet/prepareProjectStatsStage";
import {UserStage} from "../userWorkSheet/prepareUserStatsStage";
import {
    IssueLog,
    ResponsibilityOwnerShipAssigment,
    WriteIssuesContent,
    WriteIssuesWithAllConditionsContent
} from "./_models";
import {EnuKPI, SearchScripts} from "../dashboard/_models";
import {KindlyReminderConfigApp} from "../../encore.service";
import {ProjectStructure} from "../issuesHunting/_models";
import {ExtendedIssue} from "../../../../_libraries/3partyApis/jira/models/jira_extededIssue";




export class PrintIssuesIntoWorksheet {

    // -- Private Values -----------------------------------------------------------------------------------------------
    private readonly configApp = new KindlyReminderConfigApp();

    // -- Constructor  -------------------------------------------------------------------------------------------------
    constructor() {}

    // -- Public methods  -----------------------------------------------------------------------------------------------

    // Print Project ------------------------------------------------------------------------------------------------------------------------

    public async printIssuesIntoActiveWeekSheet(structure: ProjectStructure, activeWeekNumber: number) {
        console.log("PrintIssuesIntoWorksheet:printIssuesIntoActiveWeekSheet: init =========================================================================");
        console.log("PrintIssuesIntoWorksheet:printIssuesIntoActiveWeekSheet: week", activeWeekNumber);
        new GetDashBoardAndConditions().getSearchConditions().then((dashboardConfig) => {
            new ProjectStage().loadProjects(activeWeekNumber).then(async (projectWorkSheet) => {
                    return new GetPrintedIssuesList().getIssueWorksheet( activeWeekNumber).then( async(activeWorkSheetIssue) => {
                            return new UserStage().getActiveUserWorkSheet(activeWeekNumber).then(async (userWorkSheet) => {

                                    for (const issueKey of  Object.keys(structure.issues)) {
                                        // console.log("Print: project", new ExtendedIssue(structure.issues[issueKey].jiraTicket).projectKey, "issueKey", issueKey);
                                        this.writeIssueWithAllIssuesIntoSpreadSheets(
                                            {
                                                extendedTicket: new ExtendedIssue(structure.issues[issueKey].jiraTicket),
                                                ourIssues: structure.issues[issueKey].ourIssues,
                                                activeWorkSheetIssue: activeWorkSheetIssue,
                                                projectWorkSheet: projectWorkSheet,
                                                userWorkSheet: userWorkSheet,
                                                tempoHours: structure.issues[issueKey].loggedHoursInQ,
                                                dashboardConfig: dashboardConfig
                                            }
                                        );
                                    }
                                    await activeWorkSheetIssue.sheet.saveUpdatedCells(); // save all updates in one call
                                    return;
                                });

                        });
                });
        })


    }

    // Print Issues into Spreadsheet ------------------------------------------------------------------------------------------------------------------------


    private writeIssueWithAllIssuesIntoSpreadSheets(content: WriteIssuesWithAllConditionsContent): void {

        if (content.extendedTicket == null || content.extendedTicket.fields == null) {
            console.error("writeIssueWithAllIssuesIntoSpreadSheets: ticket is null?", JSON.stringify(content.extendedTicket), "project:", content.extendedTicket.projectKey, JSON.stringify(content.ourIssues))
            return;
        }

        if (Object.keys(content.ourIssues).length > 0) {
            // console.log("writeIssueWithAllIssuesIntoSpreadSheets: write single issue", content.extendedTicket.issueKey, "type:",content.ourIssues[Object.keys(content.ourIssues)[0]])
            this.writeIssueIntoWorkSheet(
                {
                    ... content,
                    ourIssue: content.ourIssues[Object.keys(content.ourIssues)[0]]
                }
            );
        }

        if (Object.keys(content.ourIssues).length > 1)  {
            for (let i = 1; i < Object.keys(content.ourIssues).length; i++) {
                // console.log("writeIssueWithAllIssuesIntoSpreadSheets: write another issue", content.extendedTicket.issueKey, "type:",content.ourIssues[Object.keys(content.ourIssues)[0]])
                this.writeIssueIntoWorkSheet(
                    {
                        ... content,
                        ourIssue: content.ourIssues[Object.keys(content.ourIssues)[i]]
                    }
                );
            }
        }
    }

    private writeIssueIntoWorkSheet(content: WriteIssuesContent): void {

        console.log("writeIssueIntoSpreadSheet trying to print issue:", content.extendedTicket.issueKey, 'ourIssue', content.ourIssue.script_name);

        const alreadyCreatedIssues: IssueLog[]  = content.activeWorkSheetIssue.issueWorkSheet.issueList.filter((is) =>  is.ticketKey == content.extendedTicket.issueKey)
        if (alreadyCreatedIssues.length > 0 && alreadyCreatedIssues.filter((is) =>  is.scriptName == content.ourIssue.script_name).length > 0) {
            console.log("writeIssueIntoSpreadSheet issue", content.extendedTicket.issueKey, "already exist in worksheet" );
            return;
        }

        const fixedStatusCell       = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.fixedStatusCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const projectKeyCell        = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.projectKeyCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const ticketKeyCell         = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.ticketKeyCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const statusCell            = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.ticketStatusCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const ticketTypeCell        = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.ticketTypeCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const vicePresidentOwnerCell= content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.ticketVPCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const projectOwnerCell      = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.projectOwnerCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const ticketOwnerCell       = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.ticketOwnerCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const whoIsResponsibleNameCell  = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.responsibilityOwnerCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const issueCellHowToFixThat = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.howToFixIssueCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const tempoHours            = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.tempoHoursCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const reportedCell          = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.issueReportedCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const latestUpdateCell      = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.issueLatestUpdateCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const missingTempoFormula   = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.missingInTempoFormulaCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const scriptName            = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.scriptNameCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);

        const projectOwnerEmailCell     = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.projectOwnerEmailCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);

        const responsibilityOwnerEmailCell = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.responsibilityOwnerEmailCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const ticketOwnerEmailCell      = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.ticketOwnerEmailCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);
        const ticketVPEmailCell         = content.activeWorkSheetIssue.sheet.getCellByA1(content.activeWorkSheetIssue.issueWorkSheet.cells.cells.ticketVPEmailCell + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow);

        if (content.ourIssue.kpi_policy == EnuKPI.Mandatory) {
            fixedStatusCell.value = 'TODO';
        } else if (content.ourIssue.kpi_policy == EnuKPI.Optionally) {
            fixedStatusCell.value = 'RECOMMENDED';
        } else {
            fixedStatusCell.value = content.ourIssue.kpi_policy;
        }

        projectKeyCell.value = content.extendedTicket.projectKey;
        ticketKeyCell.value = content.extendedTicket.issueKeyAsLink;
        ticketTypeCell.value = content.extendedTicket.issueType;
        statusCell.value = content.extendedTicket.status;

        // Valueas are set Only and Read only once. (Its not possible set and read!) // https://github.com/theoephraim/node-google-spreadsheet/issues/402
        let projectOwnerTemporaryValue: string  = "";
        let projectOwnerEmailTemporaryValue: string = "";
        let vicePresidentOwnerTemporaryValue: string = "";
        let ticketVPEmailCellTemporaryValue: string = "";

        if (content.projectWorkSheet.projectOwnerShipOverview.byProject[content.extendedTicket.projectKey]) {
            projectOwnerTemporaryValue = content.projectWorkSheet.projectOwnerShipOverview.byProject[content.extendedTicket.projectKey].owner_name ? content.projectWorkSheet.projectOwnerShipOverview.byProject[content.extendedTicket.projectKey].owner_name : "No owner";
            projectOwnerEmailTemporaryValue = content.projectWorkSheet.projectOwnerShipOverview.byProject[content.extendedTicket.projectKey].owner_email ? content.projectWorkSheet.projectOwnerShipOverview.byProject[content.extendedTicket.projectKey].owner_email : "No owner";
            vicePresidentOwnerTemporaryValue = content.projectWorkSheet.projectOwnerShipOverview.byProject[content.extendedTicket.projectKey].vp_manager_name;
            ticketVPEmailCellTemporaryValue = content.projectWorkSheet.projectOwnerShipOverview.byProject[content.extendedTicket.projectKey].vp_manager_email;
        }

        ticketOwnerCell.value = content.extendedTicket.assignee ? content.extendedTicket.assignee.displayName : "No owner";
        ticketOwnerEmailCell.value = content.extendedTicket.assignee ? content.extendedTicket.assignee.emailAddress : "No owner";

        issueCellHowToFixThat.value = content.ourIssue.how_to_fix_description;
        latestUpdateCell.value = content.extendedTicket.updated.toDateString();
        reportedCell.value     = content.extendedTicket.created.toDateString();
        missingTempoFormula.value = '=if( NE(A' + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow + ',\"DONE\"),K' + content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow + ', 0)';
        scriptName.value  = content.ourIssue.script_name;



        // Special Conditions for QR project
        if (content.extendedTicket.projectKey == "QR" && content.extendedTicket.parent != null) {
            console.log("writeIssueIntoSpreadSheet special condition for QR project");
            if (content.dashboardConfig.projectOverride[content.extendedTicket.parent.issueKey]) {
                projectOwnerTemporaryValue = content.dashboardConfig.projectOverride[content.extendedTicket.parent.issueKey].project_owner_name;
                projectOwnerEmailTemporaryValue = content.dashboardConfig.projectOverride[content.extendedTicket.parent.issueKey].project_owner_email;
                vicePresidentOwnerTemporaryValue  = content.dashboardConfig.projectOverride[content.extendedTicket.parent.issueKey].project_owner_name;
                ticketVPEmailCellTemporaryValue = content.dashboardConfig.projectOverride[content.extendedTicket.parent.issueKey].project_owner_email;
            } else {
                projectOwnerTemporaryValue = content.dashboardConfig.projectOverride["else"].project_owner_name;
                projectOwnerEmailTemporaryValue = content.dashboardConfig.projectOverride["else"].project_owner_email;
                vicePresidentOwnerTemporaryValue  = content.dashboardConfig.projectOverride["else"].project_owner_name;
                ticketVPEmailCellTemporaryValue = content.dashboardConfig.projectOverride["else"].project_owner_email;
            }
        }

        // Final Set
        projectOwnerCell.value = projectOwnerTemporaryValue;
        projectOwnerEmailCell.value = projectOwnerEmailTemporaryValue;
        vicePresidentOwnerCell.value = vicePresidentOwnerTemporaryValue;
        ticketVPEmailCell.value = ticketVPEmailCellTemporaryValue;

        this.sortByPriorityOwnership({
            ourIssue: content.ourIssue,
            extendedTicket: content.extendedTicket,
            responsibleOwner: {
                nameCell: whoIsResponsibleNameCell,
                emailCell: responsibilityOwnerEmailCell
            },
            projectOwner: {
                nameString: projectOwnerTemporaryValue,
                emailString: projectOwnerEmailTemporaryValue
            },
            vpOwner: {
                nameString: vicePresidentOwnerTemporaryValue,
                emailString: ticketVPEmailCellTemporaryValue
            },
            userWorkSheet: content.userWorkSheet
        });

        if (content.ourIssue.script_name == SearchScripts.tickWithTempoNoParent) {
            tempoHours.value = content.tempoHours  ? (content.tempoHours / 60 / 60) : 0; // structure.issues[extendedTicket.issueKey].loggedHoursInQ ;
        }

        content.activeWorkSheetIssue.issueWorkSheet.latestIndexOfRow++;
    }

    private sortByPriorityOwnership(ownership: ResponsibilityOwnerShipAssigment): void {

        console.log("sortByPriorityOwnership: ownership");

        if (ownership.priorityCopyOwnerShip == null) {
            console.log("sortByPriorityOwnership: priorityCopyOwnerShip is null");
            ownership. priorityCopyOwnerShip = ownership.ourIssue.priorityTicketOwnership.map((x) => x);
            console.log("sortByPriorityOwnership: priorityCopyOwnerShip priorityCopyOwnerShip:",   ownership. priorityCopyOwnerShip);
        }

        if(ownership.priorityCopyOwnerShip.length == 0) {
            console.log("sortByPriorityOwnership: priorityCopyOwnerShip length == 0");
            ownership.responsibleOwner.nameCell.value = ownership.projectOwner.nameString;
            ownership.responsibleOwner.emailCell.value = ownership.projectOwner.emailString;
            return;
        }


        const priority: string | undefined =  ownership.priorityCopyOwnerShip.shift();

        if(!priority) {
            return;
        }

        console.log("sortByPriorityOwnership: check First priority:", priority);

        switch (priority) {
            case "ProjectOwner": {
                console.log("sortByPriorityOwnership: its ProjectOwner: what we have in ", ownership.projectOwner.nameString);
                if (ownership.projectOwner.nameString != "No owner") {
                    console.log("sortByPriorityOwnership: its ProjectOwner: set Responsibiliy owner");
                    ownership.responsibleOwner.nameCell.value = ownership.projectOwner.nameString;
                    ownership.responsibleOwner.emailCell.value = ownership.projectOwner.emailString
                    return;
                }
                break;
            }
            case "TicketOwner": {
                if (ownership.extendedTicket.assignee && ownership.extendedTicket.assignee.active) {
                    ownership.responsibleOwner.nameCell.value = ownership.extendedTicket.assignee.displayName;
                    ownership.responsibleOwner.emailCell.value = ownership.extendedTicket.assignee.emailAddress;
                    return;
                }
                break;
            }
            case "TicketCreator": {
                if (ownership.extendedTicket.creator && ownership.extendedTicket.creator.active) {
                    ownership.responsibleOwner.nameCell.value = ownership.extendedTicket.creator.displayName;
                    ownership.responsibleOwner.emailCell.value =ownership.extendedTicket.creator.emailAddress;
                    return;
                }
                break;
            }
            case "VP": {
                if (ownership.vpOwner.nameString != "No owner") {
                    ownership.responsibleOwner.nameCell.value = ownership.vpOwner.nameString;
                    ownership.responsibleOwner.emailCell.value = ownership.vpOwner.emailString;
                    return;
                }
                break;
            }
            default: {
                console.log("sortByPriorityOwnership: check First - its Default checking probably by mail?:", priority);
                if (priority.includes("@")) {
                    ownership.responsibleOwner.nameCell.value = ownership.userWorkSheet.userWorkSheet.users[priority] ?
                        ownership.userWorkSheet.userWorkSheet.users[priority].userName : priority;
                    ownership.responsibleOwner.emailCell.value = priority;
                    return;
                }
            }
        }

        return this.sortByPriorityOwnership(ownership);
    }


}
