import { Service } from "encore.dev/service";
import { GrouponServiceProvider } from "../../../libs/core/service_management/models/models";
import { Topic } from "encore.dev/pubsub";
import { GlobalDealFrameworkMessage } from "./api_models/subscriptions.models";

// ==== SERVICE ========================================================================================================

export const service = new Service("globalDealFrameworkService_dealDraftCreation");
new GrouponServiceProvider(service, {
  name: "Deal draft creation tooling",
  description: "Global Draft creation tooling",
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

// ==== SERVICE secrets =================================================================================================

// ==== Available Emitted Topics =======================================================================================

export const dealDraftCreation_dealDraftWs = new Topic<GlobalDealFrameworkMessage>("dealDraftCreation_dealDraftWs", {
  deliveryGuarantee: "at-least-once",
});
export const userNotification_notificationsWs = new Topic<GlobalDealFrameworkMessage>("userNotification_notificationsWs", {
  deliveryGuarantee: "at-least-once",
});

// ==== SERVICE CONFIG =================================================================================================

// ==== SERVICE STATIC VARIABLES =======================================================================================
