


export class Tempo_wokLogsRequest {
    authorIds?: number;
    projectId?: number;
    issueId?: string;
    offset?: number = 0;
    limit?: number = 200;
    from?: string;
    to?: string;
    week?: number; // Only for operations
}

export class WokLogsRequestByIssue {
    updatedFrom?: number;
    from?: string;
    to?: string;
}
