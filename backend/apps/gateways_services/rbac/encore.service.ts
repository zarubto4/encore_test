import { Service } from "encore.dev/service";
import { GrouponServiceProvider } from "../../../libs/core/service_management/models/models";

// ==== SERVICE ========================================================================================================

export const service = new Service("gatewayService_rbac");
new GrouponServiceProvider(service, {
  name: "RBAC - Role Base Access Services for ServerLess",
  description:
    "Validation - External and Internal Validation for incoming Requests by covered service RBAC. It's not replacing RBAC backend, but its only for proxy.",
  contacts: {
    serviceOwnerEmail: "c_tzaruba@groupon.com",
    techLeadEmail: "c_tzaruba@groupon.com",
    productOwnerEmail: "c_tzaruba@groupon.com",
  },
  team: {
    email: "beam_core@groupon.com",
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
// # none

// ==== SERVICE PERMISSIONS ============================================================================================
// # none

// ==== AVAILABLE EMITTED TOPICS =======================================================================================
// # none

// ==== SERVICE CONFIG =================================================================================================
// # none
