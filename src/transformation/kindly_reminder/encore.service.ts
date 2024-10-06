import { Service } from "encore.dev/service";
import {JiraService} from "../../_libraries/3partyApis/jira/jira_service";
import {GoogleDocsService} from "../../_libraries/3partyApis/googleDocs/googleDocs_service";
import {AsanaService} from "../../_libraries/3partyApis/asana/asana_service";
import {TempoService} from "../../_libraries/3partyApis/tempo/tempo_service";
import { secret } from "encore.dev/config";

// ==== SERVICE ========================================================================================================
export default new Service("transformation_kindly_reminder");

// ==== SERVICE secrets =================================================================================================

const kindlyReminder_tempoService_token    = secret("kindlyReminder_tempoService2_token")
const kindlyReminder_asanaService_token    = secret("kindlyReminder_asanaService_token")
const kindlyReminder_googleService_privateKey    = secret("kindlyReminder_googleService_privateKey")
const kindlyReminder_googleService_clientEmail    = secret("kindlyReminder_googleService_clientEmail")
const kindlyReminder_jiraService_email    = secret("kindlyReminder_jiraService_email")
const kindlyReminder_jiraService_apiToken    = secret("kindlyReminder_jiraService_apiToken")

// ==== SERVICE CONFIG =================================================================================================


export class KindlyReminderConfigApp {

    // Helpers - Jira
    public readonly jiraServices: JiraService = new JiraService({
        email: kindlyReminder_jiraService_email(),
        apiToken: kindlyReminder_jiraService_apiToken(),
    });

    public readonly googleServices: GoogleDocsService = new GoogleDocsService({
        privateKey: kindlyReminder_googleService_privateKey(),
        clientEmail: kindlyReminder_googleService_clientEmail()
    });

    public readonly asanaService: AsanaService = new AsanaService({
        accessToken: kindlyReminder_asanaService_token()
    });

    public readonly tempoService: TempoService = new TempoService( {
        accessToken: kindlyReminder_tempoService_token()
    });

}

export const kindlyReminder_spreadSheetId     = '1sc1odN1DK72fYZVVlMz99o18mKFWKKfUeLLUSll5Twk';
export const kindlyReminder_managersWorkSheetId                     = 879128958;    // WorkDay
export const kindlyReminder_projectWorkSheetId                      = 226816260;    // Project
export const kindlyReminder_userWorkSheetId                          = 62957161;     // Users Stats
export const kindlyReminder_dashboardWorkSheetId                    = 303737385;    // Dashboard with Config

export const  kindlyReminder_asana_project_id               = '1207778959375434';              // Production
export const  kindlyReminder_asana_project_section_id       = '1207778959375446';      // Production
export const  kindlyReminder_asana_fallowers_to_remove: string[]                = ['1204853356727858'];      // Production

export const  kindlyReminder_hideThiesVps: string[] = [
    "Barbara Weisz",        // CSO
    "Jiri Ponrt",           // CFO
    "Zuzana Vydrova",       // FF Director
    "Adam Lindsey",         // GO Director
    "Zdenek Linc",          // CMO
];

export const kindlyReminder_hideThiesVpsConvertor: Record<string, string> = {
    "Barbara Weisz" :  "non-PE (SLS)",        // CSO
    "Jiri Ponrt" : "non-PE (FIN)",           // CFO
    "Adam Lindsey" : "non-PE (GO)",          // GO Director
    "Zdenek Linc" : "non-PE (MAR)",          // CMO
}

export const kindlyReminder_grouponVPs: string[] = [
        "c_vrysanek@groupon.com", // "Vojtech Rysanek",      // CTO
        "dredmond@groupon.com",   // "Darren Redmond",       // VP Engineering
        "nranjanray@groupon.com", // "Nikash RanjanRay",     // VP Engineering
        "c_jlongauer@groupon.com", // "Juraj Longauer",      // VP Engineering
        "c_tsikola@groupon.com",  // "Tomas Sikola",         //  VP Transformation
        "c_drybar@groupon.com",   // "David Rybar",          // Director IT
        "c_mjerabek@groupon.com", // "Michal Jerabek",       // CPO
        // "Barbara Weisz",       // CSO
        // "Jiri Ponrt",          // CFO
        "c_zvydrova@groupon.com", // "Zuzana Vydrova",       // FF Director
        "alindsey@groupon.com",    // "Adam Lindsey",         // GO Director
        "c_zlinc@groupon.com",     // "Zdenek Linc",          // CMO
 ];

// For IssueAllInHunterGenerator
export const kindlyReminder_testProjectConditions = [] // ["QR"]; // ["QR", "GAPI"]; // <--- Change this if you want to apply script only for selected projects
