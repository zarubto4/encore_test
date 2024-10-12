import { Service } from "encore.dev/service";
import { GrouponServiceProvider } from "../../../libs/core/service_management/models/models";
import { StreamInOut } from "../../../../../../../../../opt/homebrew/Cellar/encore/1.41.9/libexec/runtimes/js/encore.dev/api/mod";
import { SendMessageToClient } from "./subscriptions.pubsub";
import { Topic } from "encore.dev/pubsub";
import { StreamLineDefaultInMessage, StreamLineDefaultOutMessage } from "./security/request_models.models";

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

// ==== Available Emitted Topics =======================================================================================

// 👾 Emit to this topic - don't subscribe it.
export const streamLine_sub_clientMessage = new Topic<SendMessageToClient>("streamLine_sub_clientMessage", { deliveryGuarantee: "at-least-once" });
// export const test_not_working = streamLine_sub_clientMessage;

// ==== SERVICE CONFIG =================================================================================================

export type ServiceSubscribeListEnum = "global_deal_framework";

export const streamLine_emitMessagesToServices: { type: ServiceSubscribeListEnum; topic: Topic<never> | null }[] =
  // 👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾
  [
    {
      type: "global_deal_framework",
      topic: null, //streamLine_sub_clientMessage,
    },
  ];

// ==== SERVICE STATIC VARIABLES =======================================================================================

export const connectedStreams = new Map<string, Map<string, StreamInOut<StreamLineDefaultInMessage, StreamLineDefaultOutMessage>>>(); // Map to hold all connected streams, <user_id, <connect_id, ws>>
