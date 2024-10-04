


// https://developers.asana.com/reference/createtask
export class CreateTask {
    name?: string;
    approval_status?: ('pending' | 'completed' | 'approved'| 'rejected');
    completed?: boolean;
    due_at?: string;  // Clasic timestamp
    due_on?: string; // Format YYYY-MM-DD
    notes?: string; // Free-form textual information associated with the task (i.e. its description).
    html_notes?: string; // HTML free form text
    assignee?: string | null;
    assignee_section?: string;
    custom_fields?: any;
    parent?: any;
    projects?: string[];
    tags?: string[];
    error?: any
}

export class UpdateTask {
    name?: string;
    approval_status?: ('pending' | 'completed' | 'approved'| 'rejected');
    completed?: boolean;
    due_at?: string;  // Clasic timestamp
    due_on?: string; // Format YYYY-MM-DD
    notes?: string; // Free-form textual information associated with the task (i.e. its description).
    html_notes?: string; // HTML free form text
    assignee?: string;
    assignee_section?: string;
    custom_fields?: any;
    parent?: any;
    projects?: string[];
    tags?: string[];
    error?: any
}

export class CreateStory {
    text?: string;
    html_text?:  string;
    sticker_name?: ("dancing_unicorn")
}
