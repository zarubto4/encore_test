

export interface IssueUserStructure {
    [userEmail: string]: UserStructure
}

export interface UserStructure {
    user: {
        user_name: string,
        user_email: string
    };
    issues: Stats
}

export interface ConvertedAndAgregatedHoursByIssue {
    [issueId: string]: {
        loggedHoursInQ: number
    }
}
export class Stats {
    TODO: number = 0;
    RECOMMENDED: number = 0;
    DONE: number = 0;
    SKIP: number = 0;
    "Cap Labour": number = 0;
}

