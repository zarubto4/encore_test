import {
  bigPicture_productRoadMap_dataWorkSheet_2024_Q4,
  bigPicture_productRoadMap_mainWorkSheet_2024_Q4,
  bigPicture_productRoadMap_spreadSheetId,
  BigPictureConfigApp,
} from "../../encore.service";
import { ProductCostTrackingIndexes, ProductCostTrackingWorkSheets } from "./jiraInitiativesTempoReport.models";
import { ProductRoadmapService } from "../product_roadmap/productRoadmap.service";
import moment from "moment";
import { ChildHierarchyIssueResponse } from "../../../../../libs/3partyApis/jira/models/jira_childHierarchyIssue";

export class GlobalTempoInitiativesCapLaborOverview {
  jql =
    "project = QR AND type = Initiative AND parent NOT IN (QR-111, QR-31, QR-34, QR-154, QR-203, QR-173, QR-645, QR-644, QR-475) ORDER BY created DESC";
  jql_themes = "project = QR AND type = Themes ORDER BY created DESC";

  map = {};

  // -- Private Values -----------------------------------------------------------------------------------------------

  private readonly configApp = new BigPictureConfigApp();

  // -- Constructor  -------------------------------------------------------------------------------------------------
  // constructor() {}

  // -- Public methods  -----------------------------------------------------------------------------------------------

  public async runScript(): Promise<void> {
    console.log("GlobalTempoInitiativesCapLaborOverview:generate init");

    const workSheets = await this.prepare();
    /*
    const workSheets: ProductCostTrackingWorkSheets = {};
    workSheets["2024-Q4"] = {
      firstWeek: 40,
      indexMap: {
        w38: "I",
        w39: "J",
        w40: "K",
        w41: "L",
        w42: "M",
      },
      loadedTickets: {
        "QR-773": 9,
        "QR-774": 10,
        "QR-772": 11,
        "QR-768": 12,
        "QR-778": 16,
      },
      doc_stats: await this.configApp.googleServices.spreadsheet.getSpreadsheetWithWorksheetLoadCellsAndGetRows(
        bigPicture_productRoadMap_spreadSheetId,
        bigPicture_productRoadMap_dataWorkSheet_2024_Q4,
        "A1:AF300",
        { offset: 8 },
      ),
      doc: await this.configApp.googleServices.spreadsheet.getSpreadsheetWithWorksheetLoadCellsAndGetRows(
        bigPicture_productRoadMap_spreadSheetId,
        bigPicture_productRoadMap_mainWorkSheet_2024_Q4,
        "A1:AF300",
        { offset: 8 },
      ),
    };*/

    console.log("time to print---------------------------------------------------------");

    const productCostTrackingIndexes = new ProductCostTrackingIndexes();
    let update: number | null = null; // for frequent file update
    for (const qKey of Object.keys(workSheets)) {
      console.log("qKey:", qKey);
      const quarter = workSheets[qKey];
      for (const jiraTicketKey of Object.keys(quarter.loadedTickets)) {
        console.log(" - jiraTicket:", jiraTicketKey, "row", quarter.loadedTickets[jiraTicketKey]);

        const childs = await this.configApp.jiraServices.issue.getAllChildIssues(jiraTicketKey);

        for (let week = quarter.firstWeek - 2; week <= moment().isoWeek() - 1; week++) {
          console.log("     - check week:", week, "index", quarter.indexMap["w" + week], "actual week", moment().isoWeek());

          if (!quarter.indexMap["w" + week]) {
            console.error("     - indexMap:", week, "in indexMap is missing");
            continue;
          }

          if (!quarter.loadedTickets[jiraTicketKey]) {
            console.error("     - loadedTickets:", jiraTicketKey, "in loadedTickets is missing", JSON.stringify(quarter.loadedTickets));
            continue;
          }

          const value = quarter.doc_stats.sheet.getCellByA1(quarter.indexMap["w" + week] + quarter.loadedTickets[jiraTicketKey]).value;
          console.log("     - value:", value);

          if (value != null && value.toString().length > 0) {
            console.log("     - week:", week, "is already filled with value:", value);
          } else {
            console.log("   - week:", week, "is required number of childs:", childs.issues.length);
            quarter.doc_stats.sheet.getCellByA1(quarter.indexMap["w" + week] + quarter.loadedTickets[jiraTicketKey]).value =
              await this.getWeek(jiraTicketKey, childs, week);

            if (update == null || update < moment().unix()) {
              console.log("   - time to update content");
              await quarter.doc_stats.sheet.saveUpdatedCells();
              update = moment().add(10, "second").unix();
            }
          }
        }
        quarter.doc_stats.sheet.getCellByA1(productCostTrackingIndexes.cells.totalTimeSpend + quarter.loadedTickets[jiraTicketKey]).value =
          await this.updateTotalTime(jiraTicketKey, childs);
      }

      await quarter.doc_stats.sheet.saveUpdatedCells();
    }
  }

  private async updateTotalTime(jiraTicketKey: string, childs: ChildHierarchyIssueResponse) {
    if (childs.issues.length > 0) {
      const totalResult = await this.configApp.tempoService.getWorkLogsByIssueList(
        childs.issues.map((i) => i.id),
        {
          from: moment().startOf("year").format("YYYY-MM-DD"),
          to: moment().format("YYYY-MM-DD"),
        },
      );
      return this.configApp.tempoService.count(totalResult.workLogs);
    } else {
      return 0;
    }
  }

  private async getWeek(jiraTicketKey: string, childs: ChildHierarchyIssueResponse, week: number) {
    if (childs.issues.length > 0) {
      const totalResult = await this.configApp.tempoService.getWorkLogsByIssueList(
        childs.issues.map((i) => i.id),
        {
          from: moment().week(week).startOf("week").format("YYYY-MM-DD"),
          to: moment().week(week).endOf("week").format("YYYY-MM-DD"),
          week: week,
        },
      );
      console.log("   - week:", week, " returning value: ", this.configApp.tempoService.count(totalResult.workLogs));
      return this.configApp.tempoService.count(totalResult.workLogs);
    } else {
      return 0;
    }
  }

  private async prepare(): Promise<ProductCostTrackingWorkSheets> {
    // List of Worksheets
    const workSheets: ProductCostTrackingWorkSheets = {};

    // Get 2024 Q4
    workSheets["2024-Q4"] = {
      firstWeek: 40,
      indexMap: {},
      loadedTickets: {},
      doc_stats: await this.configApp.googleServices.spreadsheet.getSpreadsheetWithWorksheetLoadCellsAndGetRows(
        bigPicture_productRoadMap_spreadSheetId,
        bigPicture_productRoadMap_dataWorkSheet_2024_Q4,
        "A1:AJ300",
        { offset: 8 },
      ),
      doc: await this.configApp.googleServices.spreadsheet.getSpreadsheetWithWorksheetLoadCellsAndGetRows(
        bigPicture_productRoadMap_spreadSheetId,
        bigPicture_productRoadMap_mainWorkSheet_2024_Q4,
        "A1:AF300",
        { offset: 8 },
      ),
    };

    const asanaTicketsSortedByQuarters = await new ProductRoadmapService().getSorter(workSheets);
    console.log("Stage ONe is done");

    // Create map of indexes -> reason is that we have different Week Column
    for (const qKey of Object.keys(workSheets)) {
      console.log("qKey:", qKey);
      const productCostTrackingIndexes = new ProductCostTrackingIndexes();
      const quarter = workSheets[qKey];
      console.log("columnCount:", quarter.doc_stats.sheet.columnCount);
      console.log("headerIndexRow:", productCostTrackingIndexes.headerIndexRow);
      for (let i = 0; i < quarter.doc_stats.sheet.columnCount; i++) {
        console.log(
          "Header",
          quarter.doc_stats.sheet.getCell(productCostTrackingIndexes.headerIndexRow, i).value,
          "a1:",
          quarter.doc_stats.sheet.getCell(productCostTrackingIndexes.headerIndexRow, i).a1Address,
          "column:",
          quarter.doc_stats.sheet.getCell(productCostTrackingIndexes.headerIndexRow, i).columnIndex,
          "a1Column:",
          quarter.doc_stats.sheet.getCell(productCostTrackingIndexes.headerIndexRow, i).a1Column,
          "row",
          quarter.doc_stats.sheet.getCell(productCostTrackingIndexes.headerIndexRow, i).rowIndex,
          "a1Row",
          quarter.doc_stats.sheet.getCell(productCostTrackingIndexes.headerIndexRow, i).a1Row,
        );
        quarter.indexMap[quarter.doc_stats.sheet.getCell(productCostTrackingIndexes.headerIndexRow, i).value + ""] =
          quarter.doc_stats.sheet.getCell(productCostTrackingIndexes.headerIndexRow, i).a1Column;
      }

      // Get Jira Tickets
      for (const row of quarter.doc_stats.rows) {
        console.log(
          "row:",
          row.rowNumber,
          "Jira",
          quarter.doc_stats.sheet.getCellByA1(productCostTrackingIndexes.cells.ticketJira + row.rowNumber).value,
        );
        const cellValueJiraTicket = quarter.doc_stats.sheet.getCellByA1(
          productCostTrackingIndexes.cells.ticketJira + row.rowNumber,
        ).stringValue;

        if (cellValueJiraTicket != null) {
          quarter.loadedTickets[cellValueJiraTicket] = row.rowNumber;
          productCostTrackingIndexes.latestIndexOfRow = row.rowNumber + 1;
        }

        if (cellValueJiraTicket == null) {
          break;
        }
      }

      for (const strategicObjectKey of Object.keys(asanaTicketsSortedByQuarters[qKey].strategicObjectives)) {
        console.log("  strategicObjectKey:", strategicObjectKey);
        const strategicObject = asanaTicketsSortedByQuarters[qKey].strategicObjectives[strategicObjectKey];
        for (const themeKey of Object.keys(strategicObject.group_themes)) {
          const theme = strategicObject.group_themes[themeKey];
          console.log("  strategicObjectKey:", strategicObjectKey);
          console.log("               theme:", themeKey);

          for (const ticket of theme.tickets) {
            console.log("               ticket:", ticket.asana_ticket.gid + ":", ticket.asana_ticket.name);
            const jiraTicketNumber = ticket.asana_ticket.custom_fields_parsed["1207650952964344"]?.text_value;

            if (!jiraTicketNumber) {
              console.log("                    missing jira ticket");
              continue;
            }

            if (!jiraTicketNumber.includes("QR-")) {
              console.log("                    not QR ticket!");
              continue;
            }

            console.log("                        jira ticket:", jiraTicketNumber);

            if (!quarter.loadedTickets[jiraTicketNumber]) {
              console.log("                        jira ticket is not in loaded map. Required to add and print");
              const jiraTicketFromAsana = ticket.asana_ticket.custom_fields_parsed["1207650952964344"]?.text_value;

              if (!jiraTicketFromAsana) {
                continue;
              }

              quarter.loadedTickets[jiraTicketFromAsana] = productCostTrackingIndexes.latestIndexOfRow;

              quarter.doc_stats.sheet.getCellByA1(
                productCostTrackingIndexes.cells.ticketPriority + productCostTrackingIndexes.latestIndexOfRow,
              ).value = ticket.asana_ticket.custom_fields_parsed["1207921702169265"]?.enum_value?.name;

              quarter.doc_stats.sheet.getCellByA1(
                productCostTrackingIndexes.cells.ticketSummary + productCostTrackingIndexes.latestIndexOfRow,
              ).value = ticket.asana_ticket.name;

              quarter.doc_stats.sheet.getCellByA1(
                productCostTrackingIndexes.cells.ticketJira + productCostTrackingIndexes.latestIndexOfRow,
              ).value = '=hyperlink("https://groupondev.atlassian.net/browse/' + jiraTicketFromAsana + '";"' + jiraTicketFromAsana + '")';

              quarter.doc_stats.sheet.getCellByA1(
                productCostTrackingIndexes.cells.estimateAtBeginning + quarter.loadedTickets[jiraTicketNumber],
              ).numberValue = Math.round(
                (ticket.asana_ticket.custom_fields_parsed["1207921702169258"]?.number_value
                  ? ticket.asana_ticket.custom_fields_parsed["1207921702169258"].number_value
                  : 0) +
                  (ticket.asana_ticket.custom_fields_parsed["1208169980261768"]?.number_value
                    ? ticket.asana_ticket.custom_fields_parsed["1208169980261768"].number_value
                    : 0),
              );

              quarter.doc_stats.sheet.getCellByA1(
                productCostTrackingIndexes.cells.ticketAsana + quarter.loadedTickets[jiraTicketNumber],
              ).value = '=hyperlink("https://app.asana.com/0/1207921702169255/' + ticket.asana_ticket.gid + '";"Asana")';

              productCostTrackingIndexes.latestIndexOfRow++;
            } else {
              console.log("                        jira ticket already in loaded map. Required jut to update status");

              quarter.doc_stats.sheet.getCellByA1(
                productCostTrackingIndexes.cells.ticketPriority + quarter.loadedTickets[jiraTicketNumber],
              ).value = ticket.asana_ticket.custom_fields_parsed["1207921702169265"]?.enum_value?.name;

              quarter.doc_stats.sheet.getCellByA1(
                productCostTrackingIndexes.cells.ticketSummary + quarter.loadedTickets[jiraTicketNumber],
              ).value = ticket.asana_ticket.name;

              quarter.doc_stats.sheet.getCellByA1(
                productCostTrackingIndexes.cells.ticketJiraStatus + quarter.loadedTickets[jiraTicketNumber],
              ).value = ticket.asana_ticket.custom_fields_parsed["1208179548296766"]?.enum_value?.name
                ? ticket.asana_ticket.custom_fields_parsed["1208179548296766"]?.enum_value?.name
                : "";

              // TODO Smazat
              quarter.doc_stats.sheet.getCellByA1(
                productCostTrackingIndexes.cells.ticketAsana + quarter.loadedTickets[jiraTicketNumber],
              ).value = '=hyperlink("https://app.asana.com/0/1207921702169255/' + ticket.asana_ticket.gid + '";"Asana")';

              // TODO Smazat
              quarter.doc_stats.sheet.getCellByA1(
                productCostTrackingIndexes.cells.estimateAtBeginning + quarter.loadedTickets[jiraTicketNumber],
              ).numberValue = Math.round(
                (ticket.asana_ticket.custom_fields_parsed["1207921702169258"]?.number_value
                  ? ticket.asana_ticket.custom_fields_parsed["1207921702169258"].number_value
                  : 0) +
                  (ticket.asana_ticket.custom_fields_parsed["1208169980261768"]?.number_value
                    ? ticket.asana_ticket.custom_fields_parsed["1208169980261768"].number_value
                    : 0),
              );
            }
          }
        }
      }
      console.log("     saving doc");
      await quarter.doc_stats.sheet.saveUpdatedCells();
    }

    return workSheets;
  }
}
