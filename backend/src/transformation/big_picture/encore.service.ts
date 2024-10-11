import { Service } from "encore.dev/service";
import { GoogleDocsService } from "../../_libraries/3partyApis/googleDocs/googleDocs_service";
import { AsanaService } from "../../_libraries/3partyApis/asana/asana_service";
import { TempoService } from "../../_libraries/3partyApis/tempo/tempo_service";
import { secret } from "encore.dev/config";

// ==== SERVICE ========================================================================================================
new Service("transformation_bigPicture");

// ==== SERVICE secrets =================================================================================================

const bigPicture_tempoService_token = secret("bigPicture_tempoService2_token");
const bigPicture_asanaService_token = secret("bigPicture_asanaService_token");
const bigPicture_googleService_privateKey = secret("bigPicture_googleService_privateKey");
const bigPicture_googleService_clientEmail = secret("bigPicture_googleService_clientEmail");

// ==== SERVICE CONFIG =================================================================================================

export class BigPictureConfigApp {
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

export const bigPicture_sTeam_spreadSheetId = "1sc1odN1DK72fYZVVlMz99o18mKFWKKfUeLLUSll5Twk";
export const bigPicture_sTeam_managersWorkSheetId = 879128958;
export const bigPicture_asana_project_id = "1207778959375434"; // Asana Kindly Reminder Production
