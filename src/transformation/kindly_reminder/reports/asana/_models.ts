import moment, {Moment} from "moment";
import {IssueLog} from "../getIssues/_models";


export interface CreateTaskForVP {
    owner_name: string,
    owner_email: string,
    assign_gid: string | null,
    week_number: number,
    deadline: Moment,
    created_as_string: string,
    deadline_as_string: string,
    number_of_issues: string,
    worksheet_link: string,
    parent_ticket_id: string,
    week_ticket_id: string,
    vPs_issues: Record<string, {
            howToFixThat: string
            issue: IssueLog[]
        }>
}

export interface CreateTaskForProjectOwner {
    owner_email: string;
    created_as_string: string;
    deadline_as_string: string;
    owner_name: string;
    project_is_active: boolean;
    number_of_issues: string;
    project_name: string;
    assign_gid: string | null;
    projectIssues: { issues_number: number; issues: Record<string, { howToFixThat: string; issue: IssueLog[] }> };
    week_ticket_id: string;
    worksheet_link: string;
    parent_ticket_id: string;
    week_number: number;
    deadline: moment.Moment
}

export interface CreateTaskForIssuesOwner {
    owner_name: string,
    owner_email: string,
    project_name: string,
    assign_gid: string | null,
    week_number: number,
    deadline: Moment,
    created_as_string: string,
    deadline_as_string: string,
    number_of_issues: string,
    worksheet_link: string,
    parent_ticket_id: string,
    week_ticket_id: string,
    userIssues: {
        issues: Record<string, {
                howToFixThat: string
                issue: IssueLog[]
            }>,
        issues_number: number
    }
}

export type GetListOfIssues = Record<string, {
        howToFixThat: string
        issue: IssueLog[]
    }>;
