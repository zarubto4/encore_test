export interface AsanaTicketsListResult {
  data?: AsanaTicket[];
  error?: {
    message: string;
  };
}

export interface AsanaTicketResult {
  data?: AsanaTicket;
  error?: {
    message: string;
  };
}

export interface AsanaTicket {
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
  resource_type: "task";
  name: string;
  modified_at: string; // '2024-07-09T06:57:42.686Z';
  actual_time_minutes: number;
  created_at: string; //'2024-07-09T06:57:40.194Z';
  num_likes: number;
  completed: false;
  workspace: {
    gid: string;
    resource_type: string;
    name: string;
  };
  assignee: {
    gid: string;
    name: string;
    resource_type: "user" | string;
  };
  assignee_section?: {
    gid: string;
    name: string;
    resource_type: "section" | string;
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
  memberships: Record<
    "project" | "section",
    {
      gid: string;
      name: string;
      resource_type: "project" | "section";
    }
  >[];
  custom_fields: {
    gid: string;
    enabled: boolean;
    name: string;
    description: string;
    display_value: string;
    resource_subtype: "number" | "enum" | "people" | "text" | "date";
    resource_type: "custom_field";
    is_formula_fieldM: boolean;
    is_value_read_only?: boolean;
    number_value?: number;
    date_value?: {
      date_time: string;
    };
    text_value?: string;
    precision?: number;
    people_value?: {
      gid: string;
      name: string;
      resource_type: "user";
    }[];
    enum_options?: {
      gid: string;
      color: string;
      enabled: boolean;
      name: string;
      resource_type: "enum_option";
    }[];
    enum_value?: {
      gid: string;
      color: string;
      enabled: boolean;
      name: string;
      resource_type: "enum_option";
    };
  }[];
  custom_fields_parsed: AsanaTicketCustomFields;
}

/**
 * We have structure in Glat map by name and also by Keys (Duplicate)
 *
 * AsanaTicketCustomFields = {
 *   "xxx_name" : {
 *     id: "123"
 *     name: "xxx_name"
 *   },
 *   "123" : {
 *     id: "123"
 *     name: "xxx_name"
 *   }
 * }
 */
export type AsanaTicketCustomFields = Record<
  string, // asana_section_id
  {
    gid: string;
    type: "number" | "enum" | "people" | "text" | "date";
    enum_value_id?: string;
    text_value?: string;
    number_value?: number;
    display_value?: string | number;
    name?: string;
    date_time?: string;
    user_ids: string[];
    people_values: {
      gid: string;
      name: string;
    }[];
    enum_value?: {
      id: string;
      name: string;
    };
    options: Record<
      string,
      {
        gid: string;
        color: string;
        enabled: boolean;
        name: string;
        resource_type: "enum_option";
      }
    >;
    options_ids: string[];
  }
>;

// -----------------------------------------------------------------------------------------------

export class AsanaUsersResult {
  data: AsanaUsersResultUser[] = [];

  byMail: Record<string, AsanaUsersResultUser> = {};

  byName: Record<string, AsanaUsersResultUser> = {};

  byId: Record<string, AsanaUsersResultUser> = {};

  error?: {
    message: string;
  };

  constructor(error: string) {
    this.error = {
      message: error,
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
  };

  constructor(error: string) {
    this.error = {
      message: error,
    };
  }
}
export class ProjectSection {
  gid?: string;
  name?: string;
  resource_type?: string;
  error?: {
    message: string;
  };

  constructor(error: string) {
    this.error = {
      message: error,
    };
  }
}
