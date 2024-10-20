import {
  bigPicture_globalInitiatives_asanaProjects,
  bigPicture_productRoadMap_mainWorkSheet_2024_Q4,
  bigPicture_productRoadMap_mainWorkSheet_2025_Q1,
  bigPicture_productRoadMap_spreadSheetId,
  BigPictureConfigApp,
} from "../../encore.service";
import log from "encore.dev/log";
import { ExtendedIssue } from "../../../../../libs/3partyApis/jira/models/jira_extededIssue";
import { Sorter, SortType, TransformationBigPictureInitiativeMap, TransformationBigPictureQuarterMap } from "../../models/api.models";
import { ProductRoadmapIndexes } from "./productRoadmap.models";
import { SpreadSheetWorkSheetWithRows } from "../../../../../libs/3partyApis/googleDocs/models/config";

// console.log("Asana Ticket:-----");
// console.log("  gid:", asanaTicket.gid);
// console.log("  ticket:", asanaTicket.name);
// console.log("  completed:", asanaTicket.completed);
// console.log("  section:", asanaTicket.assignee_section?.name);
// console.log("  assignee:", asanaTicket.assignee?.name);
// console.log("    ", "OrgEst Eng", asanaTicket.custom_fields_parsed["1207921702169258"]?.number_value);
// console.log("    ", "OrgEst Others:", asanaTicket.custom_fields_parsed["1208169980261768"]?.number_value);
// console.log("    ", "CPO approvement:", asanaTicket.custom_fields_parsed["1207921702169260"]?.enum_value?.name);
// console.log("    ", "Priority:", asanaTicket.custom_fields_parsed["1207921702169265"]?.enum_value?.name);
// console.log("    ", "Quarter:", asanaTicket.custom_fields_parsed["1207921702169271"]?.enum_value?.name);
// console.log("    ", "PM responsible:", asanaTicket.custom_fields_parsed["1208150820765644"]?.people_values?.length);
// console.log("    ", "EM responsible:", asanaTicket.custom_fields_parsed["1208150820765640"]?.people_values?.length);
// console.log("    ", "UX responsible:", asanaTicket.custom_fields_parsed["1208150820765642"]?.people_values?.length);
// console.log("    ", "Type:", asanaTicket.custom_fields_parsed["1208179848059789"]?.enum_value?.name);
// console.log("    ", "Description F:", asanaTicket.custom_fields_parsed["1208508846416202"]?.text_value);
// console.log("    ", "Spend Hours:", asanaTicket.custom_fields_parsed["1207921704130775"]?.number_value);
// console.log("    ", "Warning status:", asanaTicket.custom_fields_parsed["1207921704130777"]?.enum_value?.name);
// console.log("    ", "Jira Ticket:", asanaTicket.custom_fields_parsed["1207650952964344"]?.text_value);
// console.log("    ", "Jira Status:", asanaTicket.custom_fields_parsed["1208179548296766"]?.enum_value?.name);

export class ProductRoadmapService {
  // -- Private Values -----------------------------------------------------------------------------------------------

  private readonly configApp = new BigPictureConfigApp();

  // -- Constructor  -------------------------------------------------------------------------------------------------
  // constructor() {}

  // -- Public methods  -----------------------------------------------------------------------------------------------
  async runScript(): Promise<void> {
    log.trace("runScript:: script is running");

    // List of Worksheets
    const workSheets: Record<string, { doc: SpreadSheetWorkSheetWithRows }> = {};

    // Add 2024 - Q4
    workSheets["2024-Q4"] = {
      doc: await this.configApp.googleServices.spreadsheet.getSpreadsheetWithWorksheetLoadCellsAndGetRows(
        bigPicture_productRoadMap_spreadSheetId,
        bigPicture_productRoadMap_mainWorkSheet_2024_Q4,
        "A1:M300",
        { offset: 8 },
      ),
    };

    // Add 2025 - Q1
    workSheets["2025-Q1"] = {
      doc: await this.configApp.googleServices.spreadsheet.getSpreadsheetWithWorksheetLoadCellsAndGetRows(
        bigPicture_productRoadMap_spreadSheetId,
        bigPicture_productRoadMap_mainWorkSheet_2025_Q1,
        "A1:M300",
        { offset: 8 },
      ),
    };

    // Sorter
    const asanaTicketsSortedByQuarters: SortType = await this.getSorter(workSheets);
    await this.print(asanaTicketsSortedByQuarters, workSheets);
  }

  public async getSorter(
    workSheets: Record<
      string,
      {
        doc: SpreadSheetWorkSheetWithRows;
      }
    >,
  ): Promise<SortType> {
    const allValidAsanaTicket = await this.ticketsFromGlobalInitiativesProject();

    // Get ASana Sections with extracted Jira themes (Same name as Asana section is Jira theme)
    const sectionsWithJiraThemes = await this.getAsanaSections();
    const sorter: Sorter = new Sorter();

    for (const ticket of allValidAsanaTicket) {
      console.log("ticket:", ticket.asanaTicket.gid, "section", ticket.sectionId, "quarter", ticket.quarter);

      if (!sectionsWithJiraThemes.sectionAsanaId[ticket.sectionId]) {
        console.log(" - missing section in sectionAsanaIds");
        continue;
      }

      if (!workSheets[ticket.quarter]) {
        console.log(" - available worksheets not supporting this ticket in quarter ", ticket.quarter);
        continue;
      }

      if (sectionsWithJiraThemes.sectionAsanaId[ticket.sectionId].theme_jira) {
        sorter.insert(
          ticket.quarter,
          workSheets[ticket.quarter].doc,
          sectionsWithJiraThemes.sectionAsanaId[ticket.sectionId].theme_jira.fields["customfield_22046"].value,
          sectionsWithJiraThemes.sectionAsanaId[ticket.sectionId].theme_jira,
          ticket.asanaTicket,
        );
      } else {
        console.log(" -- section not has own Jira Theme");
      }
    }

    return sorter.sort;
  }

  // Private -----------------------------------------------------------------------------------------------------------

  private async print(srt: SortType, workSheets: Record<string, { doc: SpreadSheetWorkSheetWithRows }>) {
    // Remove Sheets style before generation
    await this.cleanSheetsMerging(workSheets);
    for (const quarterKey of Object.keys(srt)) {
      const quarter = srt[quarterKey];
      const sheetConfig = new ProductRoadmapIndexes();

      if (!workSheets[quarterKey]) {
        continue;
      }

      console.log("quarter:", quarterKey);
      for (const strategicObjectKey of Object.keys(quarter.strategicObjectives)) {
        const strategicObject = quarter.strategicObjectives[strategicObjectKey];

        console.log("    strategicObjectKey:", strategicObjectKey);

        if (!strategicObject) {
          log.error("strategicObjectKey is musing!");
          continue;
        }

        console.log(
          "    strategicObjectKey: startRowIndex:",
          sheetConfig.latestIndexOfRow - 1,
          "endRowIndex:",
          sheetConfig.latestIndexOfRow + strategicObject.total_issues - 1,
          "total_issues",
          strategicObject.total_issues,
        );

        if (strategicObject.total_issues > 1) {
          await quarter.quarterWorkSheet.sheet.mergeCells({
            startRowIndex: sheetConfig.latestIndexOfRow - 1,
            endRowIndex: sheetConfig.latestIndexOfRow + strategicObject.total_issues - 1,
            startColumnIndex: 0,
            endColumnIndex: 1,
          });
        }

        for (const themeKey of Object.keys(strategicObject.group_themes)) {
          const theme = strategicObject.group_themes[themeKey];

          console.log("                       - theme:", themeKey);
          console.log(
            "                       - theme: startRowIndex:",
            sheetConfig.latestIndexOfRow - 1,
            "endRowIndex:",
            sheetConfig.latestIndexOfRow + theme.total_issues - 1,
            "total_issues",
            theme.total_issues,
          );
          if (theme.total_issues > 1) {
            await quarter.quarterWorkSheet.sheet.mergeCells({
              startRowIndex: sheetConfig.latestIndexOfRow - 1,
              endRowIndex: sheetConfig.latestIndexOfRow + theme.total_issues - 1,
              startColumnIndex: 1,
              endColumnIndex: 2,
            });
          }

          for (const ticket of theme.tickets) {
            console.log("                             - ticket:", ticket.asana_ticket.gid);
            quarter.quarterWorkSheet.sheet.getCellByA1(sheetConfig.cells.strategicObjectives + sheetConfig.latestIndexOfRow).value =
              theme.jiraTheme.fields["customfield_22046"].value;

            quarter.quarterWorkSheet.sheet.getCellByA1(sheetConfig.cells.grouponThemes + sheetConfig.latestIndexOfRow).value =
              theme.jiraTheme.summary;

            quarter.quarterWorkSheet.sheet.getCellByA1(sheetConfig.cells.ticketSummary + sheetConfig.latestIndexOfRow).value =
              ticket.asana_ticket.name;
            quarter.quarterWorkSheet.sheet.getCellByA1(sheetConfig.cells.ticketPriority + sheetConfig.latestIndexOfRow).value =
              ticket.asana_ticket.custom_fields_parsed["1207921702169265"]?.enum_value?.name;

            quarter.quarterWorkSheet.sheet.getCellByA1(sheetConfig.cells.ticketManagerialStatus + sheetConfig.latestIndexOfRow).value =
              ticket.asana_ticket.custom_fields_parsed["1207921702169260"]?.enum_value?.name
                ? ticket.asana_ticket.custom_fields_parsed["1207921702169260"]?.enum_value?.name
                : "Before validation";

            quarter.quarterWorkSheet.sheet.getCellByA1(sheetConfig.cells.ticketAsana + sheetConfig.latestIndexOfRow).value =
              '=hyperlink("https://app.asana.com/0/1207921702169255/' + ticket.asana_ticket.gid + '";"Asana")';

            quarter.quarterWorkSheet.sheet.getCellByA1(sheetConfig.cells.ticketJira + sheetConfig.latestIndexOfRow).value = ticket
              .asana_ticket.custom_fields_parsed["1207650952964344"]?.text_value
              ? '=hyperlink("https://groupondev.atlassian.net/browse/' +
                ticket.asana_ticket.custom_fields_parsed["1207650952964344"]?.text_value +
                '";"Jira")'
              : "";

            quarter.quarterWorkSheet.sheet.getCellByA1(sheetConfig.cells.ticketJiraStatus + sheetConfig.latestIndexOfRow).value = ticket
              .asana_ticket.custom_fields_parsed["1208179548296766"]?.enum_value?.name
              ? ticket.asana_ticket.custom_fields_parsed["1208179548296766"]?.enum_value?.name
              : "";

            quarter.quarterWorkSheet.sheet.getCellByA1(sheetConfig.cells.ticketPM + sheetConfig.latestIndexOfRow).value =
              ticket.asana_ticket.custom_fields_parsed["1208150820765644"]?.display_value;

            quarter.quarterWorkSheet.sheet.getCellByA1(sheetConfig.cells.ticketUX + sheetConfig.latestIndexOfRow).value =
              ticket.asana_ticket.custom_fields_parsed["1208150820765642"]?.display_value;

            quarter.quarterWorkSheet.sheet.getCellByA1(sheetConfig.cells.ticketEM + sheetConfig.latestIndexOfRow).value =
              ticket.asana_ticket.custom_fields_parsed["1208150820765640"]?.display_value;

            quarter.quarterWorkSheet.sheet.getCellByA1(sheetConfig.cells.ticketShortDescription + sheetConfig.latestIndexOfRow).value =
              ticket.asana_ticket.custom_fields_parsed["1208508846416202"]?.text_value;

            sheetConfig.latestIndexOfRow++;
          }
        }
      }

      await quarter.quarterWorkSheet.sheet.saveUpdatedCells();
    }
  }

  private async cleanSheetsMerging(
    workSheets: Record<
      string,
      {
        doc: SpreadSheetWorkSheetWithRows;
      }
    >,
  ) {
    // Clean Cells
    for (const sheetKey of Object.keys(workSheets)) {
      await workSheets[sheetKey].doc.sheet.unmergeCells({
        startRowIndex: 9,
        endRowIndex: 150,
        startColumnIndex: 0,
        endColumnIndex: 15,
      });
      await workSheets[sheetKey].doc.sheet.saveUpdatedCells();
    }
  }

  private async ticketsFromGlobalInitiativesProject(): Promise<TransformationBigPictureQuarterMap[]> {
    const asanaTicketsResult: TransformationBigPictureQuarterMap[] = [];

    const asanaTickets = await this.configApp.asanaService.tasks.getAllTasks({
      project: bigPicture_globalInitiatives_asanaProjects,
    });

    log.trace("runScript::number of tickets", { asanaTickets: asanaTickets?.data?.length });
    if (asanaTickets == null || asanaTickets.data == null) {
      throw new Error("Missing Asana Tickets");
    }

    for (const asanaTicket of asanaTickets.data) {
      if (asanaTicket.name.includes("Example")) {
        continue;
      }

      let asanaTicketSection = asanaTicket?.assignee_section?.gid;

      if (!asanaTicketSection) {
        const ticketAgain = await this.configApp.asanaService.tasks.getTask(asanaTicket.gid);
        asanaTicketSection = ticketAgain?.data?.memberships?.find((o) => o.project.gid == bigPicture_globalInitiatives_asanaProjects)
          ?.section.gid;
        if (!asanaTicketSection) {
          console.log("  -missing section: task: ", ticketAgain);
          continue;
        }
      }

      const quarter = asanaTicket.custom_fields_parsed["1207921702169271"]?.enum_value?.name;
      if (!quarter) {
        // console.log("  -missing quarter");
        continue;
      }

      asanaTicketsResult.push({
        asanaTicket: asanaTicket,
        sectionId: asanaTicketSection,
        quarter: quarter,
      });
    }
    return asanaTicketsResult;
  }

  private async getAsanaSections(): Promise<TransformationBigPictureInitiativeMap> {
    const structure: TransformationBigPictureInitiativeMap = { sectionAsanaId: {} };

    const asanaSections = await this.configApp.asanaService.projects.getProjectSections(bigPicture_globalInitiatives_asanaProjects);
    log.trace("runScript::number of sections", { asanaSections: asanaSections?.data?.length });

    if (asanaSections == null || asanaSections.data == null) {
      throw new Error("Missing Asana Sections");
    }

    const themeJiraTickets = await this.configApp.jiraServices.issue.getAllIssues({
      jql: "project = QR AND type = Themes ORDER BY created DESC",
    });
    log.trace("runScript::number of theme tickets in Jira", { themeJiraTickets: themeJiraTickets?.length });

    if (themeJiraTickets == null || themeJiraTickets.length == 0) {
      throw new Error("Missing Jira themes");
    }

    for (const section of asanaSections.data) {
      // log.trace("Asana Section:", { section_name: section.name });
      if (!section.name || !section.gid) {
        continue;
      }

      const foundedJira = themeJiraTickets.find((jira) => new ExtendedIssue(jira).summary == section.name);
      if (foundedJira == null) {
        if (!section.name.includes("READ") && !section.name.includes("Untitled section")) {
          log.error("For ASana Section name not founded JIRA Theme", { section_name: section.name });
        }
        continue;
      }

      const foundedExtendedJiraTheme = new ExtendedIssue(foundedJira);
      structure.sectionAsanaId[section.gid] = {
        theme_name: section.name,
        theme_description: "Description",
        theme_asana_section: section,
        theme_jira: foundedExtendedJiraTheme,
      };
    }

    return structure;
  }
}
