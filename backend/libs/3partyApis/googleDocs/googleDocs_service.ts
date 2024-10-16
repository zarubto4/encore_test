import { AuthenticationForGoogle } from "./models/config";
import { JWT } from "google-auth-library";
import { GoogleSpreadSheetService } from "./googleDocs_supportedDocs/googleDocs_spreadSheet";

export class GoogleDocsService {
  // Helpers - Jira
  private readonly googleAccountAuth: JWT;
  private readonly _spreadSheetGoogle: GoogleSpreadSheetService;

  constructor(auth: AuthenticationForGoogle) {
    this.googleAccountAuth = new JWT({
      email: auth.clientEmail,
      key: auth.privateKey.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Google Docs Init Services
    this._spreadSheetGoogle = new GoogleSpreadSheetService(this.googleAccountAuth);
  }

  get spreadsheet(): GoogleSpreadSheetService {
    return this._spreadSheetGoogle;
  }
}
