import { Service } from "encore.dev/service";
import { GoogleDocsService } from "../../../libs/3partyApis/googleDocs/googleDocs_service";
import { AsanaService } from "../../../libs/3partyApis/asana/asana_service";
import { TempoService } from "../../../libs/3partyApis/tempo/tempo_service";
import { secret } from "encore.dev/config";
import { GrouponServiceProvider } from "../../../libs/core/service_management/models/models";
import { service } from "../../globalDealFramework_services/dealSchemaManager/encore.service";
import { JiraService } from "../../../libs/3partyApis/jira/jira_service";

// ==== SERVICE ========================================================================================================

new Service("transformationService_bigPicture");
new GrouponServiceProvider(service, {
  name: "Big Picture, Product Roadmap",
  description: "Generation interesting reports for Product & Engineering",
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

const bigPicture_tempoService_token = secret("kindlyReminder_tempoService2_token");
const bigPicture_asanaService_token = secret("kindlyReminder_asanaService_token");
const bigPicture_googleService_privateKey = secret("kindlyReminder_googleService_privateKey");
const bigPicture_googleService_clientEmail = secret("kindlyReminder_googleService_clientEmail");
const bigPicture_jiraService_email = secret("kindlyReminder_jiraService_email");
const bigPicture_jiraService_apiToken = secret("kindlyReminder_jiraService_apiToken");

// ==== SERVICE PERMISSIONS ============================================================================================
// # none

// ==== AVAILABLE EMITTED TOPICS =======================================================================================
// # none

// ==== SERVICE CONFIG =================================================================================================

export class BigPictureConfigApp {
  public readonly jiraServices: JiraService = new JiraService({
    email: bigPicture_jiraService_email(),
    apiToken: bigPicture_jiraService_apiToken(),
  });

  public readonly googleServices: GoogleDocsService = new GoogleDocsService({
    privateKey: bigPicture_googleService_privateKey(),
    clientEmail: bigPicture_googleService_clientEmail(),
  });

  public readonly asanaService: AsanaService = new AsanaService({
    accessToken: bigPicture_asanaService_token(),
  });

  public readonly tempoService: TempoService = new TempoService({
    accessToken: bigPicture_tempoService_token(),
  });
}

export const bigPicture_productRoadMap_spreadSheetId = "1JOVG_4IjaNFZ4T20YWivZgF7dsv2U9ZmkciVrv0aU5c";
export const bigPicture_productRoadMap_mainWorkSheet_2024_Q4 = 1258647570;
export const bigPicture_productRoadMap_mainWorkSheet_2025_Q1 = 1840938196;

export const bigPicture_globalInitiatives_asanaProjects = "1207921702169255";
