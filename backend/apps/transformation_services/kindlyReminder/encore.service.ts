import { Service } from "encore.dev/service";
import { JiraService } from "../../../libs/3partyApis/jira/jira_service";
import { GoogleDocsService } from "../../../libs/3partyApis/googleDocs/googleDocs_service";
import { AsanaService } from "../../../libs/3partyApis/asana/asana_service";
import { TempoService } from "../../../libs/3partyApis/tempo/tempo_service";
import { secret } from "encore.dev/config";
import { GrouponServiceProvider } from "../../../libs/core/service_management/models/models";

// ==== SERVICE ========================================================================================================

export const service = new Service("transformationService_kindlyReminder");
new GrouponServiceProvider(service, {
  name: "Kindly Reminder - Transformation",
  description: "Eye of Souron",
  contacts: {
    serviceOwnerEmail: "c_tzaruba@groupon.com",
    techLeadEmail: "c_tzaruba@groupon.com",
    productOwnerEmail: "c_tzaruba@groupon.com",
  },
  team: {
    email: "transformation@groupon.com",
    opsgenie: null,
    googleChatSpaceUrl: "www.google.com",
  },
  jiraProject: {
    projectName: "TPMO",
    epicBugBucketName: "TMPO-33",
  },
  documentation: [],
});

// ==== SERVICE SECRETS ================================================================================================

const kindlyReminder_tempoService_token = secret("kindlyReminder_tempoService2_token");
const kindlyReminder_asanaService_token = secret("kindlyReminder_asanaService_token");
const kindlyReminder_googleService_privateKey = secret("kindlyReminder_googleService_privateKey");
const kindlyReminder_googleService_clientEmail = secret("kindlyReminder_googleService_clientEmail");
const kindlyReminder_jiraService_email = secret("kindlyReminder_jiraService_email");
const kindlyReminder_jiraService_apiToken = secret("kindlyReminder_jiraService_apiToken");

// ==== SERVICE PERMISSIONS ============================================================================================
// # none

// ==== AVAILABLE EMITTED TOPICS =======================================================================================
// # none

// ==== SERVICE CONFIG =================================================================================================

export class KindlyReminderConfigApp {
  public readonly jiraServices: JiraService = new JiraService({
    email: kindlyReminder_jiraService_email(),
    apiToken: kindlyReminder_jiraService_apiToken(),
  });

  public readonly googleServices: GoogleDocsService = new GoogleDocsService({
    privateKey: kindlyReminder_googleService_privateKey(),
    clientEmail: kindlyReminder_googleService_clientEmail(),
  });

  public readonly asanaService: AsanaService = new AsanaService({
    accessToken: kindlyReminder_asanaService_token(),
  });

  public readonly tempoService: TempoService = new TempoService({
    accessToken: kindlyReminder_tempoService_token(),
  });
}

export const kindlyReminder_spreadSheetId = "1sc1odN1DK72fYZVVlMz99o18mKFWKKfUeLLUSll5Twk"; // Google spreadsheet ID
export const kindlyReminder_managersWorkSheetId = 879128958; // Google spreadsheet - worksheet ID - WorkDay
export const kindlyReminder_projectWorkSheetId = 226816260; // Google spreadsheet - worksheet ID - Project
export const kindlyReminder_userWorkSheetId = 62957161; // Google spreadsheet - worksheet ID - Users Stats
export const kindlyReminder_dashboardWorkSheetId = 303737385; // Google spreadsheet - worksheet ID - Dashboard with Config

export const kindlyReminder_asana_project_id = "1207778959375434"; // Asana Kindly Reminder Production
export const kindlyReminder_asana_project_section_id = "1207778959375446"; // Project section in Asana project
export const kindlyReminder_asana_followers_to_remove: string[] = ["1204853356727858"]; // User ids that we want to remove after ticket was created

// TODOž
export const kindlyReminder_asana_dispute_form = "https://form.asana.com/?k=XD2--zRlGU4GRv0S9bb5VQ&d=8437193015852";

export const kindlyReminder_hideThiesVps: string[] = [
  "Barbara Weisz", // CSO
  "Jiri Ponrt", // CFO
  "Zuzana Vydrova", // FF Director
  "Adam Lindsey", // GO Director
  "Zdenek Linc", // CMO
];

export const kindlyReminder_hideThiesVpsConvertor: Record<string, string> = {
  "Barbara Weisz": "non-PE (SLS)", // CSO
  "Jiri Ponrt": "non-PE (FIN)", // CFO
  "Adam Lindsey": "non-PE (GO)", // GO Director
  "Zdenek Linc": "non-PE (MAR)", // CMO
};

export const kindlyReminder_grouponVPs: string[] = [
  "c_vrysanek@groupon.com", // "Vojtech Rysanek",      // CTO
  "dredmond@groupon.com", // "Darren Redmond",         // VP Engineering
  "nranjanray@groupon.com", // "Nikash RanjanRay",     // VP Engineering
  "c_jlongauer@groupon.com", // "Juraj Longauer",      // VP Engineering
  "c_tsikola@groupon.com", // "Tomas Sikola",          //  VP Transformation
  "c_drybar@groupon.com", // "David Rybar",            // Director IT
  "c_mjerabek@groupon.com", // "Michal Jerabek",       // CPO
  // "Barbara Weisz",       // CSO
  // "Jiri Ponrt",          // CFO
  "c_zvydrova@groupon.com", // "Zuzana Vydrova",       // FF Director
  "alindsey@groupon.com", // "Adam Lindsey",           // GO Director
  "c_zlinc@groupon.com", // "Zdenek Linc",             // CMO
];

// For IssueAllInHunterGenerator
export const kindlyReminder_testProjectConditions = []; // ["QR"]; // ["QR", "GAPI"]; // <--- Change this if you want to apply script only for selected projects
