import {SearchCondition} from "../dashboard/_models";
import {Issue} from "jira.js/src/version3/models/issue";
import {replaceKeys} from "../../../../_libraries/core/parsing_and_formating/stringInject";

export interface IssueProjectStructure {
    [projectKey: string]: ProjectStructure
}

export interface ProjectStructure {
    issues: {
        [issueKey: string]: {
            ourIssues:  {
                [scriptName: string]: SearchCondition
            },
            loggedHoursInQ: number, // In seconds
            jiraTicket: Issue
        }
    }
}

export class JQLProjectQueriesAutomation {

    public findNonEpicsWithEpicDesignation: string = 'type != Epic' +
        ' AND "epic designation[dropdown]" IN (Feature, KTLO)' +
        ' ORDER BY created DESC';

    public findKTLOEpicsWithoutEpicDesignation: string = 'type = Epic' +
        ' AND ( "epic designation[dropdown]" = Feature OR  "epic designation[dropdown]" is EMPTY)' +
        ' AND issue in portfolioChildIssuesOf("QR-111") ' +
        ' ORDER BY created DESC';

    public findAndFixAllNonHardlySetEpicDesignations: string = 'project IN ({projects})' +
        ' AND type = Epic' +
        ' AND ( "epic designation[dropdown]" = {type} OR  "epic designation[dropdown]" is EMPTY)' +
        ' AND created >= -34w' +
        ' ORDER BY created DESC';


    constructor(projectKey?: string) {
        if (projectKey != null) {
            for(let field of Object.keys(this)) {
                // @ts-ignore
                let stringField = <string> this[field];
                stringField = replaceKeys( stringField, {projectKey: projectKey});
            }
        }

    }
}



export class JQLProjectQueries {

    // Parent -----------------------------------------------------------------------------------------------------------

    // Parent - epic
    public findAllEpicTicketsWithoutParent: string = 'project = "{projectKey}"' +
        ' AND parent IS empty' +
        ' AND created >= "2024-04-01"' +
        ' AND type IN (Epic)' +
        ' AND status NOT IN ("Won’t do", Closed, Backlog, Done, "Canceled/Obsolete", Rejected, Resolved)' +
        ' ORDER BY created DESC';

    // Parent - initiative
    public findAllInitiativesTicketsWithoutParent: string = 'project = "{projectKey}"' +
        ' AND parent IS empty' +
        ' AND created >= "2024-04-01"' +
        ' AND type IN (Initiative)' +
        ' AND status IN (Blocked, Deploy, "In Progress", Merge, "Parking lot", QA, Reopened)' +
        ' ORDER BY created DESC';


    // Owner -----------------------------------------------------------------------------------------------------------

    // Owner - epic
    public findAllEpicTicketsWithoutOwner: string = 'project = "{projectKey}"' +
        ' AND assignee IS EMPTY' +
        ' AND type IN (Epic)' +
        ' AND created >= "2024-04-01"' +
        ' AND status NOT IN (Done, "Prod Done", "Rollout done", "Dev Done", "Won\'t Fix", "Won’t do", Delivered, Closed)' +
        ' ORDER BY created DESC';

    // Owner - initiative
    public findAllInitiativeTicketsWithoutOwner: string = 'project = "{projectKey}"' +
        ' AND assignee IS EMPTY' +
        ' AND type IN (Initiative)' +
        ' AND created >= "2024-04-01"' +
        ' AND status NOT IN (Done, "Won’t do", Closed, "Parking lot", Resolved)' +
        ' ORDER BY created DESC';

    // Owner - theme
    public findAllThemesTicketsWithoutOwner: string = 'project = "{projectKey}"' +
        ' AND assignee IS EMPTY' +
        ' AND type IN (Themes)' +
        ' ORDER BY created DESC';

    // Owner - all tickets in sprint
    public findSprintTicketsWithoutOwner: string = 'project = "{projectKey}"' +
        ' AND sprint IS NOT EMPTY AND assignee IS EMPTY' +
        ' AND created >= "2024-04-01"' +
        ' AND status IN (Blocked, Deploy, "In Progress", Merge, "Parking lot", QA, Reopened)' +
        ' ORDER BY created DESC';

    // Required fields -----------------------------------------------------------------------------------------------------------

    // Labels required - initiative - Quartals
    public findAllInitiativeWithoutLabels: string = 'project = "{projectKey}"' +
        ' AND type = Initiative' +
        ' AND status IN ("Parking lot", "To Do", "In Progress", Blocked)' +
        ' AND parent NOT IN (QR-111, QR-31, QR-154, QR-203, QR-173, QR-645, QR-644, QR-475)' +
        ' AND labels NOT IN (22Q4, 23Q1, 23Q2, 23Q3, 23Q4, 24Q1, 24Q2, 24Q3, 24Q4, 25Q1, 25Q2, 25Q3, 25Q4)' +
        ' ORDER BY created DESC';

    // Labels required - initiative - (initiative category)
    public findAllInitiativeWithoutProperField: string = 'project = "{projectKey}"' +
        ' AND assignee IS EMPTY' +
        ' AND type = Initiative' +
        ' AND status IN ("Parking lot", "To Do", "In Progress", Blocked)' +
        ' AND "initiative category[dropdown]" IS EMPTY' +
        ' ORDER BY created DESC';

    // Labels required - initiative - (initiative category)
    public findAllInitiativeWithoutOriginalEstimate: string = 'project = "{projectKey}"' +
        ' AND type = Initiative' +
        ' AND status IN ("In Progress", "Parking lot", "To Do")' +
        ' AND ' +
        ' (' +
        ' "original estimate (non-eng) - hours[number]" IS EMPTY ' +
        ' AND ' +
        ' "original estimate (eng) - hours[number]" IS EMPTY' +
        ' )' +
        ' AND parent NOT IN (QR-111, QR-31, QR-154, QR-203, QR-173, QR-645, QR-644, QR-475)' +
        ' ORDER BY created DESC';

    // Labels required - initiative - (initiative category)
    public findAllInitiativeWithoutFinancialDescription  = 'project = "{projectKey}"' +
        ' AND type = Initiative' +
        ' AND "initiative - financial description[paragraph]" is Empty ' +
        ' ORDER BY created DESC';


    // Labels required - initiative - (initiative category)
    public findAllInitiativeWithoutCustomerFacing: string = 'project = "{projectKey}"' +
        ' AND type = Initiative' +
        ' AND "initiative - customer facing[dropdown]" is EMPTY ' +
        ' ORDER BY created DESC';


    // Labels required - Themes - (strategic objectives)
    public findAllThemesWithoutProperField: string = 'project = "{projectKey}"' +
        ' AND type = Themes' +
        ' AND "strategic objectives[dropdown]" is EMPTY' +
        ' ORDER BY created DESC';

    // Labels required - Themes - (Epic Designation)
    public findAllEpicsWithoutProperFieldEpicDesignation: string = 'project = "{projectKey}"' +
        ' AND type = Epic' +
        ' AND created >= "2024-01-01"' +
        ' AND "EPIC Designation[Dropdown]" is EMPTY' +
        ' ORDER BY created DESC';

    public findSprintTicketsWithoutOriginalEstimate: string = 'project = "{projectKey}"' +
        ' AND originalEstimate is EMPTY' +
        ' AND created >= "2024-04-01"' +
        ' AND created <= "2024-06-29"' +
        ' AND status IN (Blocked, Deploy, \"In Progress\", Triage, \"To Do\", Merge, \"Parking lot\", QA, Reopened)' +
        ' ORDER BY created DESC';

    public findNonEpicsWithEpicDesignation: string = 'type != Epic' +
        ' AND "epic designation[dropdown]" IN (Feature, KTLO)' +
        ' ORDER BY created DESC';

    public findKTLOEpicsWithoutEpicDesignation: string = 'type = Epic' +
        ' AND ( "epic designation[dropdown]" = Feature OR  "epic designation[dropdown]" is EMPTY)' +
        ' AND issue in portfolioChildIssuesOf("QR-111") ' +
        ' ORDER BY created DESC';


    constructor(projectKey?: string) {
        if (projectKey != null) {
            for(let field of Object.keys(this)) {
                // @ts-ignore
                this[field]= replaceKeys(this[field], {projectKey: projectKey});
            }
        }

    }
}

