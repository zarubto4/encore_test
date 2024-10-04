
export enum EnuKPI {
    "Mandatory" = "Mandatory",
    "Optionally" = "Optionally",
    "Reminder" = "Reminder",
    "Week Overview" = "Week Overview",
    "Cap Labour" = "Cap Labour",
}

// -- Search Dasbboard - Script conditions -----
export interface SearchConditions {
    [scriptName: string]: SearchCondition
}

export interface SearchCondition {
    script_name: SearchScripts; // epicWithoutOwner
    active_rule: boolean; // true
    kpi_policy: EnuKPI; // Mandatory
    policy_description: string; // description
    who_will_be_responsible_description: string; // description
    how_to_fix_description: string // description
    jql_query: string;
    priorityTicketOwnership: ('ProjectOwner'|'TicketCreator'|'TicketOwner'|'VP' | any)[]
}

// Can be found here https://docs.google.com/spreadsheets/d/1sc1odN1DK72fYZVVlMz99o18mKFWKKfUeLLUSll5Twk/edit?gid=303737385#gid=303737385
export enum SearchScripts {
    epicWithoutOwner = "epicWithoutOwner",
    epicWithoutParent = "epicWithoutParent",
    epicWithoutDesignation = "epicWithoutDesignation",

    initiativeWithoutOwner = "initiativeWithoutOwner",
    initiativeWithoutParent = "initiativeWithoutParent",
    initiativeQRLabels = "initiativeQRLabels",
    initiativeQRFieldIC = "initiativeQRFieldIC",
    originalEstimateInitiative = "originalEstimateInitiative",
    initiativeWithoutFinancialDescription = "initiativeWithoutFinancialDescription",
    initiativeWithoutFinancialCFacing = "initiativeWithoutFinancialCFacing",

    themeQRFieldSO = "themeQRFieldSO", // Every Theme field (Strategic Objectives) must be properly set
    themeWithoutOwner = "themeWithoutOwner",
    tickWithTempoNoParent = "tickWithTempoNoParent",

    storyWithoutOwner = "storyWithoutOwner",
    sprintTicketOwner = "sprintTicketOwner",
    originalEstimateTicket = "originalEstimateTicket",

    historicTicketWithoutParent = "historicTicketWithoutParent",
    inactiveTicketOwner = "inactiveTicketOwner",
    inactiveProjectOwner = "inactiveProjectOwner",
    tempoReportChecker = "tempoReportChecker",
    spilloverInitiative = "spilloverInitiative",
    initiativeCorrectTag = "initiativeCorrectTag",
    completedParents = "completedParents",
    personalWorkingOverview = "personalWorkingOverview",
    initiativeMngOverview = "initiativeMngOverview",

    nonEpicsWithEpicDesignation = "nonEpicsWithEpicDesignation",
    ktloEpicsCheckLabel = "ktloEpicsCheckLabel",
    mandatoryFieldForEpicCheck = "mandatoryFieldForEpicCheck",
}

export class SearchConditionsCellIndexes {
    scriptsCells: {
        scriptNameColumn: string,
        kpiPolicyColumn: string,
        activeRuleColumn: string,
        policyDescriptionColumn:  string,
        whoWillBeResponsibleDescriptionColumn: string,
        howToFixDescriptionColumn: string,
        jqlQueryColumn: string,
        priorityTicketOwnershipColumn: string,
    } = {
        scriptNameColumn: 'E',
        kpiPolicyColumn: 'B',
        activeRuleColumn: 'D',
        policyDescriptionColumn: 'G',
        whoWillBeResponsibleDescriptionColumn: 'K',
        howToFixDescriptionColumn: 'N',
        jqlQueryColumn: 'S',
        priorityTicketOwnershipColumn: 'T',
    }
}

// -- Mandatory Epic Designation overrides -----
export interface MandatoryEpicDesignationFields {
    ktloProjects: string[]
    featureProjects: string[]
}

export class MandatoryEpicDesignationFieldsCellIndexes {
    scriptsCells: {
        projectListColumn: string,
    } = {
        projectListColumn: 'B',
    }
}

// -- QR project overrides  -----
export interface QRProjectOverride {
    [ticket: string]: {
        vp_name: string;
        vp_email: string;
        project_owner_name: string;
        project_owner_email: string;
    }
}

export class DashBoardQRProjectOverridesCellIndexes {
    overridesCells: {
        ticketColumn: string,
        vpNameColum: string,
        vpEmailColum: string,
        projectOwnerNameColumn:  string,
        projectOwnerEmailColumn:  string,
    } = {
        ticketColumn: 'A',
        vpNameColum: 'B',
        vpEmailColum: 'D',
        projectOwnerNameColumn: 'F',
        projectOwnerEmailColumn: 'H',
    }
}

export interface DashboardsConfigs {
    searchConditions: SearchConditions;
    projectOverride: QRProjectOverride;
    mandatoryEpicDesignationFields: MandatoryEpicDesignationFields;
}
