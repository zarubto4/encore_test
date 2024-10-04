
export interface SearchShortcut {
    startAt?: number; /**The index of the first item to return in a page of results (page offset).*/
    maxResults?: number;  /** The maximum number of items to return per page. */
}

export interface JiraPagination {
    maxResults?: number,     /** The maximum number of items that could be returned. */
    startAt?: number,        /** The index of the first item returned. */
    total?: number,         /** The number of items returned. */
}

export abstract class CommonJira {

    protected setProperlySearchIfSomethingIsMissing(search: SearchShortcut): void {
        if (!search.startAt) {
            search.startAt = 0;
        }
        if (!search.maxResults) {
            search.maxResults = 500;
        }
    }

    protected isThereMoreResults( paginationResult: JiraPagination): boolean {
        if (paginationResult == null) {
            return false;
        }

        if(paginationResult.total == null || paginationResult.startAt == null) {
            return false;
        }

        return (paginationResult.startAt + (paginationResult.maxResults ? paginationResult.maxResults : 500)) < paginationResult.total
    }

    protected increaseSearchCondition(data: { maxResults?: number, startAt?: number, total?: number }, search: SearchShortcut): SearchShortcut {

        if(data.maxResults && data.maxResults != search.maxResults) {
            search.maxResults = data.maxResults;
        }

        if(!search.startAt) {
            search.startAt = 0;
        }

        if (!search.maxResults) {
            search.maxResults = 500;
        }

        search.startAt = search.startAt + search.maxResults;
        return search;
    }

}
