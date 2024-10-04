
export interface AsanaTicketsListResult {
    data: AsanaTicket[];
    error?: any
}

export interface AsanaTicketResult {
    data: AsanaTicket;
    error?: any
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
    projects: any[];
    followers: any[];
    memberships: any[];
    custom_fields: any[];
}

// -----------------------------------------------------------------------------------------------

export class AsanaUsersResult {
    data: AsanaUsersResultUser[] = []

    byMail: {
        [email: string]: AsanaUsersResultUser
    }  = {}

    byName: {
        [name: string]: AsanaUsersResultUser
    } = {}

    byId: {
        [id: string]: AsanaUsersResultUser
    } = {}

    error?: any;

    constructor(error: string) {
        this.error = error;
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

    byName: {
        [name: string]: ProjectSection
    } = {};

    byId: {
        [id: string]: ProjectSection
    } = {};

    error?: any;

    constructor(error: string) {
        this.error = error;
    }
}
export interface ProjectSection {
    gid?: string;
    name?: string;
    resource_type?: string;
    error?: any;
}
