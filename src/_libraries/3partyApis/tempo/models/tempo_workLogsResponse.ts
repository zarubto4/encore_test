


export interface Tempo_workLogsResponse {
    metadata: {
        "count": number,
        "offset": number,
        "limit": number,
        "next": string,
    };
    results: WorkLog[];
}

export class WorkLog {

    tempoWorkogId?: number;
    issue?: {
        id: number
    };

    timeSpentSeconds?: number;
    billableSeconds?: number;
    startDate?: Date;
    startTime?: string;
    description?: string;
    createdAt?: number;
    updatedAt?: number;
    author?: {
        accountId: string
    };

    public constructor() {}

    get timeSpent(): number | null {
        return this.timeSpentSeconds ? this.timeSpentSeconds / 60 / 60 : null;
    }

    get createdAtAsDate(): Date | null {
        return this.createdAt ? new Date(this.createdAt) : null;
    }

    get updatedAtAsDate(): Date | null  {
        return this.updatedAt ? new Date(this.updatedAt) : null;
    }
}
