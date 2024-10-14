import { Service } from "encore.dev/service";

export interface MandatoryServiceConfig {
  /**
   * letters (A-Z, a-z)
   * Numbers (0-9)
   * Dashes (-)
   */
  name: string;
  description: string;
  contacts: {
    serviceOwnerEmail: string;
    techLeadEmail?: string;
    productOwnerEmail?: string;
  };
  team: {
    email?: string;
    opsgenie: string | null;
    googleChatSpaceUrl: string;
  };
  jiraProject: {
    projectName: string;
    epicBugBucketName: string;
  };
  documentation: {
    name: string;
    url: string;
  }[];
}

export class GrouponServiceProvider {
  constructor(
    private service: Service,
    protected mandatoryServiceConfig: MandatoryServiceConfig,
  ) {}
}
