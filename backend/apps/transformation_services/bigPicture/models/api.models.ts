import { AsanaTicket, ProjectSection } from "../../../../libs/3partyApis/asana/models/asana_resultsModels";
import { ExtendedIssue } from "../../../../libs/3partyApis/jira/models/jira_extededIssue";
import { SpreadSheetWorkSheet } from "../../../../libs/3partyApis/googleDocs/models/config";

export interface TransformationBigPictureUniversalRequest {
  name: "generate_product_roadmap";
}

export interface TransformationBigPictureUniversalResponse {
  status: string;
}

export interface TransformationBigPictureInitiativeMap {
  sectionAsanaId: Record<
    string, // asana_section_id
    {
      theme_name: string;
      theme_description: string;
      theme_asana_section: ProjectSection;
      theme_jira: ExtendedIssue;
    }
  >;
}

// The Reason is that we have to split tickets by quarters
export interface TransformationBigPictureQuarterMap {
  asanaTicket: AsanaTicket;
  sectionId: string;
  quarter: string;
}

export type SortType = Record<
  string, // Quarter - 24-Q4
  {
    quarterWorkSheet: SpreadSheetWorkSheet;
    strategicObjectives: Record<
      string, // strategicObjective
      {
        total_issues: number;
        group_themes: Record<
          string, // Theme
          {
            jiraTheme: ExtendedIssue;
            total_issues: number;
            tickets: {
              asana_ticket: AsanaTicket;
              jira_ticket: ExtendedIssue | null;
            }[];
          }
        >;
      }
    >;
  }
>;

export class Sorter {
  _sort: SortType = {};

  get sort(): SortType {
    return this._sort;
  }

  public insert(
    quarterIndex: string,
    quarterSpreadSheet: SpreadSheetWorkSheet,
    strategicObjectiveIndex: string,
    themeJira: ExtendedIssue,
    asanaTicket: AsanaTicket,
  ) {
    if (!this._sort[quarterIndex]) {
      this._sort[quarterIndex] = {
        quarterWorkSheet: quarterSpreadSheet,
        strategicObjectives: {},
      };
    }

    const quarter = this._sort[quarterIndex];
    if (!quarter.strategicObjectives[strategicObjectiveIndex]) {
      quarter.strategicObjectives[strategicObjectiveIndex] = {
        total_issues: 0,
        group_themes: {},
      };
    }

    const strategicObjective = quarter.strategicObjectives[strategicObjectiveIndex];
    if (!strategicObjective.group_themes[themeJira.summary]) {
      strategicObjective.group_themes[themeJira.summary] = {
        total_issues: 0,
        jiraTheme: themeJira,
        tickets: [],
      };
    }

    const theme = strategicObjective.group_themes[themeJira.summary];
    theme.tickets.push({
      asana_ticket: asanaTicket,
      jira_ticket: null,
    });
    strategicObjective.total_issues += 1;
    theme.total_issues += 1;
  }
}
