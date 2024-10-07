
export interface AsanaTicketsListResult {
    data?: AsanaTicket[];
    error?: {
        message: string;
    }
}

export interface AsanaTicketResult {
    data?: AsanaTicket;
    error?: {
        message: string;
    }
}

export interface AsanaTicket{
    gid: string;
    due_at: null;
    due_on: null;
    completed_at: null;
    num_hearts: number;
    parent: null;
    start_at: null;
    start_on: null;
    resource_subtype: string;
    notes: string;
    resource_type: 'task';
    name: string;
    modified_at: string;// '2024-07-09T06:57:42.686Z';
    actual_time_minutes: number;
    created_at: string; //'2024-07-09T06:57:40.194Z';
    num_likes: number;
    completed: false;
    assignee: null;
    workspace: {
        gid: string,
        resource_type: string,
        name: string
    };
    likes: [];
    liked: false;
    tags: [];
    hearts: [];
    hearted: false;
    permalink_url: string; // 'https://app.asana.com/0/1207755315742869/1207764922941465';
    assignee_status: string;
    projects: object[];
    followers: object[];
    memberships: object[];
    custom_fields: object[];
}

// -----------------------------------------------------------------------------------------------

export class AsanaUsersResult {
    data: AsanaUsersResultUser[] = []

    byMail: Record<string, AsanaUsersResultUser>  = {}

    byName: Record<string, AsanaUsersResultUser> = {}

    byId: Record<string, AsanaUsersResultUser> = {}

    error?: {
        message: string;
    }

    constructor(error: string) {
        this.error = {
            message:error
        };
    }
}
export interface AsanaUsersResultUser {
    gid: string;
    email: string;
    name: string;
}


// -----------------------------------------------------------------------------------------------


export class ProjectSectionResult {
    data: ProjectSection[] = [];

    byName: Record<string, ProjectSection> = {};

    byId: Record<string, ProjectSection> = {};

    error?: {
        message: string;
    }

    constructor(error: string) {
        this.error = {
            message:error
        };
    }
}
export interface ProjectSection {
    gid?: string;
    name?: string;
    resource_type?: string;
    error?: {
        message: string;
    }
}
