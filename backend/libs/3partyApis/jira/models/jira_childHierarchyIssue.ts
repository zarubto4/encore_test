import {Issue} from "jira.js/out/version3/models";

export interface ChildHierarchyIssueResponse {
    issues: Issue[];
    hierarchy: Jira_childHierarchyIssue;
}

export interface Jira_childHierarchyIssue {
    parent: string;
    children: Jira_childHierarchyIssue[]
}
