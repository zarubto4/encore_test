import { Service } from "encore.dev/service";
import { GrouponServiceProvider } from "../../../libs/core/service_management/models/models";
import { SendMessageToClient } from "./subscribers/subscriptions.pubsub";
import { Topic } from "encore.dev/pubsub";
import { StreamLineDefaultInMessage, StreamLineDefaultOutMessage } from "./models/request_models.models";
import { StreamInOut } from "encore.dev/api";

// ==== SERVICE ========================================================================================================

export const service = new Service("gatewayService_streamLine");
new GrouponServiceProvider(service, {
  name: "Gateway - StreamLine",
  description: "Websocket unified Income services",
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

// 👾 Emit to this topic - don't subscribe it.
export const streamLine_sub_clientMessage = new Topic<SendMessageToClient>("streamLine_sub_clientMessage", {
  deliveryGuarantee: "at-least-once",
});

// ==== SERVICE CONFIG =================================================================================================

// TODO migrate to Cache
export const connectedStreams = new Map<string, Map<string, StreamInOut<StreamLineDefaultInMessage, StreamLineDefaultOutMessage>>>(); // Map to hold all connected streams, <user_id, <connect_id, ws>>
