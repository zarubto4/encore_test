import { SpreadSheetWorkSheetWithRows } from "../../../../../libs/3partyApis/googleDocs/models/config";

export class ProductCostTrackingIndexes {
  cells: {
    ticketPriority: string;
    ticketSummary: string;
    ticketAsana: string;
    ticketJira: string;
    ticketJiraStatus: string;
    estimateAtBeginning: string;
    totalTimeSpend: string;
    totalCost: string;
    firstWeekColumn: string;
  } = {
    ticketPriority: "A",
    ticketSummary: "B",
    ticketAsana: "C",
    ticketJira: "D",
    ticketJiraStatus: "E",
    estimateAtBeginning: "F",
    totalTimeSpend: "G",
    totalCost: "H",
    firstWeekColumn: "I",
  };
  latestIndexOfRow = 9;
  headerIndexRow = 7;
}

export type ProductCostTrackingWorkSheets = Record<
  string,
  {
    firstWeek: number;
    indexMap: Record<string, string>;
    loadedTickets: Record<string, number>; // Loaded Jira tickets from spreadsheet (Don't generate everything again) | row number
    doc: SpreadSheetWorkSheetWithRows;
    doc_stats: SpreadSheetWorkSheetWithRows;
  }
>;
