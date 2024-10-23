import { Service } from "encore.dev/service";
import { GrouponServiceProvider } from "../../../libs/core/service_management/models/models";

// ==== SERVICE ========================================================================================================

export const service = new Service("gatewayService_notifications");
new GrouponServiceProvider(service, {
  name: "Gateway - Notifications",
  description: "Service for Emmit notifications and providing not read notifications",
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

// ==== SERVICE CONFIG =================================================================================================

// Store all subscribed websockets for Notifications
export const connectedStreams = new Map<string, string[]>(); // Map to hold all connected streams, <user_id, connect_id[]>
