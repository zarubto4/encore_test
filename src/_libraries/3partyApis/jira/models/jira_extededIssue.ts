import {Issue} from "jira.js/src/version3/models/issue";
import {User} from "jira.js/src/version3/models/user";
import {UserDetails} from "jira.js/src/version3/models/userDetails";
import {Fields} from "jira.js/src/version3/models/fields";
import {replaceKeys} from "../../../core/parsing_and_formating/stringInject";
import {printPrettyArray} from "../../../core/parsing_and_formating/printPrettyArray";

export class ExtendedIssue {

    constructor(public issue: Issue) {}

    get issueType(): string { // Epic, Initiative etc.
        if (this.issue.fields.issuetype && this.issue.fields.issuetype.name) {
            return this.issue.fields.issuetype.name;
        } else {
          throw new Error("JiraExtendedIssue - issueType not found in Object");
        }
    }

    get issueKey(): string { // QR-211
        return this.issue.key;
    }

    get issueId(): string { // jsadkfhne-123-asffsad
        return this.issue.id;
    }

    get summary(): string { // Issue Name
        return this.issue.fields.summary;
    }

    get projectKey(): string { // Issue Name
        return this.issue.key.substring(0, this.issue.key.indexOf("-") );
    }

    get labels(): string[] { // Epic, Initiative etc.
        return this.issue.fields.labels;
    }

    get updated(): Date { // Issue Name
        return new Date(this.issue.fields.updated);
    }

    get created(): Date { // Issue Name
        return new Date(this.issue.fields.created);
    }


    get summaryAsLink(): string { // Issue Name
        return replaceKeys('=hyperlink("https://groupondev.atlassian.net/browse/{{issue_key}}";"{{issue_key}}"', { issue_key:   this.summary});
    }

    get issueKeyAsLink(): string { // QR-211
        return replaceKeys('=hyperlink("https://groupondev.atlassian.net/browse/{{issue_key}}";"{{issue_key}}"', { issue_key:   this.issueKey});
    }

    get status(): string {
        if (this.issue.fields.status && this.issue.fields.status.name) {
            return this.issue.fields.status.name;
        } else {
            throw new Error("JiraExtendedIssue - status not found in Object");
        }
    }

    get creator(): User | null {
        if (this.issue.fields.creator) {
            return this.issue.fields.creator;
        } else {
            return null;
        }
    }

    get assignee(): UserDetails | null {
        if (this.issue.fields.assignee) {
            return this.issue.fields.assignee;
        } else {
            return null;
        }
    }

    get quartalTags(): string {

        const labels: string[] = [];
        if (this.labels.includes("24Q1")) { labels.push("24Q1") }
        if (this.labels.includes("24Q2")) { labels.push("24Q2") }
        if (this.labels.includes("24Q3")) { labels.push("24Q3") }
        if (this.labels.includes("24Q4")) { labels.push("24Q4") }
        if (this.labels.includes("25Q1")) { labels.push("25Q1") }
        if (this.labels.includes("25Q2")) { labels.push("25Q2") }
        if (this.labels.includes("25Q3")) { labels.push("25Q3") }
        if (this.labels.includes("25Q4")) { labels.push("25Q4") }

        return printPrettyArray(labels);
    }

    get parent(): ExtendedIssue | null{
        if (this.issue.fields.parent) {
            return new ExtendedIssue(this.issue.fields.parent);
        } else {
            return null;
        }
    }

    get parentKeyAsLink(): string | null {
        if (this.parent) {
            const parent = this.parent;
            return replaceKeys('=hyperlink("https://groupondev.atlassian.net/browse/{{issue_key}}";"{{issue_key}}"', { issue_key:   parent.issueKey});
        } else {
            return null;
        }
    }

    get fields(): Fields {
        return this.issue.fields;
    }

}
