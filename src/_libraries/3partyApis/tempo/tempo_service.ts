import {WorkLog, Tempo_workLogsResponse} from "./models/tempo_workLogsResponse";
import {Tempo_wokLogsRequest} from "./models/tempo_wokLogsRequest";
import {PromiseHttp} from "../../core/http_requests/promise_http_request";
import {AuthenticationForTempo} from "./models/tempo_config";

export class TempoService {

    private readonly apiUrl = 'https://api.tempo.io/4';
    private readonly request: PromiseHttp;
    private readonly pagingSize: number = 1000;

    constructor(authenticationTempo: AuthenticationForTempo) {
        this.request = new PromiseHttp(this.apiUrl, authenticationTempo.accessToken);
    }

    public count(logs: WorkLog[]): number {
        let no = 0;

        if (logs.length == 0) {
            return 0;
        }

        logs.forEach((log) => {
            no += log.timeSpentSeconds ? log.timeSpentSeconds : 0;
        });
        return no / 60 / 60;
    }

    public getWorkLogsByIssue(issueId: string, request: Tempo_wokLogsRequest, pageForPagination = 0) : Promise<WorkLog[]> {
        return new Promise((resolve): void => {
            console.log("getWorkLogsByIssue: issueId", issueId, "pageForPagination", pageForPagination );

            request.offset = pageForPagination;
            request.limit = 500;
            request.issueId = issueId;

            this.request.get<Tempo_workLogsResponse>('/worklogs', request, 200)
                .then((result) => {
                    console.log("getWorkLogsByIssue: issueId", issueId, "response - done");

                    if (result.error) {
                        console.log("getWorkLogsByIssue_ error:", result.error)
                        resolve([]);
                    } else {


                        if ((result.data && result.data.metadata.next) != null ) {
                            this.getWorkLogsByIssue(issueId, request, pageForPagination + this.pagingSize)
                                .then((subResult) => {
                                    try {
                                        // Merge the results and return them
                                        resolve(
                                            [ ...new Set(result.data?.results.concat(subResult)) ]
                                        );
                                    } catch (error) {
                                        console.log("getWorkLogsByIssue: error:", error)
                                        resolve([]);
                                    }

                                });
                        } else {
                            resolve(result.data ? result.data.results : []);
                        }
                    }
                });
        });
    }

    public getWorkLogsByIssueList(issueIds: string[], request: Tempo_wokLogsRequest, pageForPagination = 0) : Promise<{workLogs: WorkLog[], request:Tempo_wokLogsRequest}> {
        return new Promise((resolve): void => {
            console.log("getWorkLogsByIssue: issueIds", issueIds, request.week ?  ("week: " + request.week) : "" , "pageForPagination", pageForPagination );



            const requestSearch = {
                issueIds: issueIds,
                from: request.from,
                to: request.to
            };

            const query: Tempo_wokLogsRequest = {
                offset: pageForPagination,
                limit: this.pagingSize
            };

            this.request.post<Tempo_workLogsResponse>('/worklogs/search', query, requestSearch, 200)
                .then((result) => {

                    if (result.error) {
                        console.log("getWorkLogsByIssueList: error:", result.error)
                        resolve({
                            workLogs:[], request: request
                        });
                    } else {

                        if ((result.data && result.data.metadata.next) != null ) {
                            console.log("getWorkLogsByIssueList: offset:", pageForPagination);
                            this.getWorkLogsByIssueList(issueIds, request, pageForPagination + this.pagingSize)
                                .then((subResult) => {
                                    try {
                                        resolve({
                                            request: request,
                                            workLogs: [ ...new Set(result.data?.results.concat(subResult.workLogs))]
                                         });
                                    } catch (error) {
                                        console.log("getWorkLogsByIssueList: error:", error)
                                        resolve({
                                            workLogs:[],
                                            request: request
                                        });
                                    }

                                });
                        } else {
                            console.log("getWorkLogsByIssueList: complete response size:", result.data && result.data.results  ? result.data.results.length: "DATA IS MISSING");
                            resolve(
                                {
                                    workLogs: result.data && result.data.results ? result.data.results : [],
                                    request: request
                                }
                            );
                        }
                    }
                });
        });
    }

    public getUsersWorkLogs (request: Tempo_wokLogsRequest, pageForPagination = 0, tried = 0): Promise<WorkLog[]> {
        return new Promise((resolve): void => {

            request.offset = pageForPagination;
            request.limit = this.pagingSize;

            console.log("TempoService::projectId:", request.projectId, 'offset:', request.offset);

            this.request.get<Tempo_workLogsResponse>('/worklogs', request, 200)
                .then((result) => {

                    if (result.error) {
                        console.log("TempoService: error:", result.error, "message",  result.error.message, "data", result.data);

                        setTimeout(() =>  {

                            if (tried > 3) {
                                resolve(result.data != null ? result.data.results : []);
                            } else {
                                return this.getUsersWorkLogs(request, pageForPagination, tried ++);
                            }

                        }, 2000);

                    } else {
                        if (result.data && result.data.metadata.next != null ) {
                            this.getUsersWorkLogs(request, pageForPagination + this.pagingSize)
                                .then((subResult) => {
                                    // Merge the results and return them
                                    resolve( (result.data && result.data.results) ? result.data.results.concat(subResult) : subResult);
                                });
                        } else {
                            resolve((result.data && result.data.results) ? result.data.results : []);
                        }
                    }
                });
        });
    }

}
