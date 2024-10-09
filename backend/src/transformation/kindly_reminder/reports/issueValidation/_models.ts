
export type IssueListForValidation = Record<string, Record<string, IssueListForValidationScriptContent>>;
export interface IssueListForValidationScriptContent {
    row: number;
    fixStatus: string;
}
export interface IssueFilterResponse {
    listOfIssues: string[];
    listOfIssuesWithScripts: IssueListForValidation;
    jql: string;
}
