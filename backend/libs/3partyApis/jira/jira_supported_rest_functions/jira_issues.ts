import { Version3Client } from "jira.js";
import { SearchForIssuesUsingJql } from "jira.js/src/version3/parameters/searchForIssuesUsingJql";
import { Issue } from "jira.js/src/version3/models/issue";
import { PageIssueTypeSchemeProjects } from "jira.js/src/version3/models";
import { Jira_childHierarchyIssue, ChildHierarchyIssueResponse } from "../models/jira_childHierarchyIssue";
import * as Parameters from "jira.js/src/version3/parameters";
import { WorkLog } from "../../tempo/models/tempo_workLogsResponse";
import { GetChangeLogs } from "jira.js/src/version2/parameters";
import { Changelog } from "jira.js/src/version3/models/changelog";
import { CommonJira } from "../utils/jira_commonUtils";
import { ExtendedIssue } from "../models/jira_extededIssue";
import { replaceKeys } from "../../../core/parsing_and_formating/stringInject";
import { GetIssue } from "jira.js/src/version3/parameters/getIssue";
import log from "encore.dev/log";

export class IssuesJira extends CommonJira {
  constructor(public jiraClient: Version3Client) {
    super();
  }

  public createIssue(request: Parameters.CreateIssue): Promise<Issue | null> {
    return new Promise((resolve, reject): void => {
      this.jiraClient.issues
        .createIssue(request, (error, data) => {
          if (data == undefined) {
            log.error("createIssue: dat undefined", "error:", { err: error?.response });
            return resolve(null);
          }

          if (error) {
            log.error("createIssue: ticket - there is more then :", { err: error.response, request: request });
            return resolve(null);
          }

          this.jiraClient.issues
            .getIssue({ issueIdOrKey: data.key })
            .then((ticket) => {
              return resolve(ticket);
            })
            .catch((error) => {
              return reject(error);
            });
        })
        .then(() => {
          // Callback Done
        });
    });
  }

  public updateIssue(parameters: Parameters.EditIssue): Promise<Issue | null> {
    return new Promise((resolve): void => {
      this.jiraClient.issues
        .editIssue(parameters, (error) => {
          if (error) {
            log.error("updateIssue: ticket - there is more then :", { err: error.response, parameters: parameters });
            return resolve(null);
          }

          this.jiraClient.issues.getIssue({ issueIdOrKey: parameters.issueIdOrKey }).then((ticket) => {
            return resolve(ticket);
          });
        })
        .then(() => {
          // Callback Done
        });
    });
  }

  public getIssues(search: GetIssue): Promise<Issue | null> {
    return new Promise((resolve): void => {
      this.jiraClient.issues
        .getIssue(search, (error, data) => {
          if (data == undefined) {
            log.error("getIssues: dat undefined", "error:", { err: error?.response });
            return resolve(null);
          }

          if (error) {
            log.error("getIssues: ticket - there is more then :", { err: error.response, search: search });
            return resolve(null);
          }

          return resolve(data);
        })
        .then(() => {
          // Callback Done
        });
    });
  }

  public getIssuesChangeLogs(search: GetChangeLogs): Promise<Changelog[]> {
    // Update search if something missing, for example "maxResults" or "startAt"
    this.setProperlySearchIfSomethingIsMissing(search);

    // Create Promise to unblock threads - and build a recursive structure that can retrieve all pages of results.
    return new Promise((resolve): void => {
      this.jiraClient.issues
        .getChangeLogs(search, (error, data) => {
          if (data == undefined) {
            log.error("getIssuesChangeLogs: dat undefined", "error:", { err: error?.response });
            return resolve([]);
          }

          if (error) {
            log.error("getIssuesChangeLogs: ticket - there is more then :", { err: error.response, search: search });
            return resolve([]);
          }

          // if there is more pages with results, call next page
          // else we are on latest page, return result
          if (this.isThereMoreResults(data)) {
            log.error("getIssuesChangeLogs: ticket - there is more then :", { issueIdOrKey: search.issueIdOrKey, startAt: search.startAt });
            const searResult = this.increaseSearchCondition(data, search);
            this.getIssuesChangeLogs({
              issueIdOrKey: search.issueIdOrKey,
              startAt: searResult.startAt,
              maxResults: searResult.maxResults,
            }).then((result) => {
              // Merge the results and return them
              return resolve(data.values ? data.values.concat(result) : result);
            });
          } else {
            return resolve(data.values ? data.values : []);
          }
        })
        .then(() => {
          // Callback Done
        });
    });
  }

  public getIssueSchemaForProject(projectId: number): Promise<PageIssueTypeSchemeProjects | null> {
    return new Promise((resolve): void => {
      this.jiraClient.issueTypeSchemes
        .getIssueTypeSchemeForProjects(
          {
            projectId: [projectId],
          },
          (error, data) => {
            if (data == undefined) {
              log.error("getIssueSchemaForProject: dat undefined", "error:", { err: error?.response });
              return resolve(null);
            }

            if (error) {
              log.error("getIssueSchemaForProject: ticket - there is more then :", { err: error.response, projectId: projectId });
              return resolve(null);
            }

            return resolve(data);
          },
        )
        .then(() => {
          // Callback Done
        });
    });
  }

  public getAllIssues(search: SearchForIssuesUsingJql): Promise<Issue[]> {
    // Update search if something missing, for example "maxResults" or "startAt"
    this.setProperlySearchIfSomethingIsMissing(search);

    log.trace("getAllIssues: jql:", { jql: search.jql });

    // Create Promise to unblock threads - and build a recursive structure that can retrieve all pages of results.
    return new Promise((resolve): void => {
      this.jiraClient.issueSearch
        .searchForIssuesUsingJql(search, (error, data) => {
          if (data == undefined) {
            log.error("getAllIssues: dat undefined", "error:", { err: error?.response });
            return resolve([]);
          }

          if (error) {
            log.error("getAllIssues: ticket - there is more then :", { err: error.response, jql: search.jql });
            return resolve([]);
          }

          // if there is more pages with results, call next page
          // else we are on latest page, return result
          if (this.isThereMoreResults(data)) {
            this.getAllIssues(this.increaseSearchCondition(data, search)).then((result) => {
              // Merge the results and return them
              return resolve(data.issues ? data.issues.concat(result) : result);
            });
          } else {
            return resolve(data.issues ? data.issues : []);
          }
        })
        .then(() => {
          // Callback Done
        });
    });
  }

  public getAllChildIssues(issueKey: string): Promise<ChildHierarchyIssueResponse> {
    return new Promise((resolve): void => {
      const search: SearchForIssuesUsingJql = {
        jql: replaceKeys('issue in portfolioChildIssuesOf("{issueKey}")', { issueKey: issueKey }),
      };

      this.getAllIssues(search).then((result) => {
        // Merge the results and return them
        const formatedResult = this.findChildren(issueKey, result);
        return resolve({
          issues: result,
          hierarchy: formatedResult,
        });
      });
    });
  }

  public getUnparentedJiraTicketsLogsByTempo(projectKey: string, logs: WorkLog[]): Promise<Issue[]> {
    return new Promise((resolve): void => {
      const uniIssueIds: number[] = [];
      logs.forEach((log) => {
        if (log.issue && !uniIssueIds.includes(log.issue.id)) {
          uniIssueIds.push(log.issue.id);
        }
      });

      if (uniIssueIds.length == 0) {
        return resolve([]);
      }

      this.getUnparentedJiraTicketsLogsByTempo_partialQuery(projectKey, uniIssueIds).then((result) => {
        resolve(result);
      });
    });
  }

  private getUnparentedJiraTicketsLogsByTempo_partialQuery(projectKey: string, uniIssueIds: number[]): Promise<Issue[]> {
    return new Promise((resolve): void => {
      log.trace("getUnparentedJiraTicketsLogsByTempo_partialQuery", { projectKey: projectKey, uniIssueIds_size: uniIssueIds.length });

      const chunk: number[] = uniIssueIds.slice(0, 100);
      uniIssueIds = uniIssueIds.slice(100, uniIssueIds.length);

      this.getAllIssues({
        jql: replaceKeys(
          'project = "{projectKey}"' +
            " AND parent IS empty" +
            " AND issue in (" +
            this.getStringifyList(chunk) +
            ")" +
            " ORDER BY created DESC",
          { projectKey: projectKey },
        ),
      }).then((result) => {
        console.log("getUnparentedJiraTicketsLogsByTempo: results", { result_length: result.length });

        if (uniIssueIds.length > 0) {
          this.getUnparentedJiraTicketsLogsByTempo_partialQuery(projectKey, uniIssueIds).then((resul2) => {
            // Merge the results and return them
            return resolve(result.concat(resul2));
          });
          // if we are on latest page, return result
        } else {
          return resolve(result);
        }
      });
    });
  }

  private getStringifyList(uniIssueIds: number[]): string {
    let listOfIssuesIds = "";
    for (let i = 0; i < uniIssueIds.length; i++) {
      const log = uniIssueIds[i];
      if (i + 1 == uniIssueIds.length) {
        listOfIssuesIds = listOfIssuesIds + log; // Last item
      } else {
        listOfIssuesIds = listOfIssuesIds + log + ", ";
      }
    }
    return listOfIssuesIds;
  }

  // Privates --------------------------------------------------------------------------------------------------------

  private findChildren(parentIssueKey: string, issues: Issue[]): Jira_childHierarchyIssue {
    const formatedResult: Jira_childHierarchyIssue = {
      parent: parentIssueKey,
      children: [],
    };

    issues.forEach((i) => {
      const ei: ExtendedIssue = new ExtendedIssue(i);
      if (ei.parent && ei.parent.issueKey == parentIssueKey) {
        formatedResult.children.push({
          parent: ei.issueKey,
          children: this.findAllChildren(ei.issueKey, issues),
        });
      }
    });
    return formatedResult;
  }

  private findAllChildren(parentIssueKey: string, issues: Issue[]): Jira_childHierarchyIssue[] {
    const children: Jira_childHierarchyIssue[] = [];
    issues.forEach((i) => {
      const ei: ExtendedIssue = new ExtendedIssue(i);
      if (ei.parent && ei.parent.issueKey == parentIssueKey) {
        children.push({
          parent: ei.issueKey,
          children: this.findAllChildren(ei.issueKey, issues),
        });
      }
    });
    return children;
  }

  // Helpers ---------------------------------------------------------------------------------------------------------
}
