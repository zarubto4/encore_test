

export type IssueUserStructure = Record<string, UserStructure>; // Key: userEmail

export interface UserStructure {
    user: {
        user_name: string,
        user_email: string
    };
    issues: Stats
}

export type ConvertedAndAgregatedHoursByIssue = Record<string, {
        loggedHoursInQ: number
    }>;
export class Stats {
    TODO = 0;
    RECOMMENDED = 0;
    DONE = 0;
    SKIP = 0;
    "Cap Labour" = 0;
}

