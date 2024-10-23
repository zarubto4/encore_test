import { Subscription } from "encore.dev/pubsub";
import { connectedStreams } from "../encore.service";
import log from "encore.dev/log";
import {
  ServiceSubscribeListEnum,
  ServiceSubscribeResponseType,
  StreamLineDefaultInMessage,
  StreamLineDefaultOutMessage,
} from "../models/request_models.models";
import { userNotification_notificationsWs } from "../../../globalDealFramework_services/dealDraftCreation/encore.service";
import { StreamInOut } from "encore.dev/api";
import { GlobalDealFrameworkMessage } from "../../../globalDealFramework_services/dealDraftCreation/api_models/subscriptions.models";

// ---  Send Messages To Client  ---------------------------------------------------------------------------------------
export interface SendMessageToClient {
  user_id: string;
  connection_session_id?: string; // Optional!
  service: ServiceSubscribeListEnum;
  message_id?: string; // UUID - Always optional
  type?: ServiceSubscribeResponseType; // Always optional
  topic: string;
  message: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const streamLine = new Subscription(userNotification_notificationsWs, "gatewayService-streamLine-sendToClient", {
  handler: async (event) => {
    try {
      log.trace("streamLine: incoming message for WebSocket", { ...event, user_connected: connectedStreams.has(event.user_id) });
      if (connectedStreams.has(event.user_id)) {
        const userConnections = connectedStreams.get(event.user_id);
        if (userConnections) {
          if (!event.connection_session_id) {
            for (const [connection_session_id, stream] of userConnections) {
              await send(event, connection_session_id, stream);
            }
          } else {
            const userSessionConnections = userConnections.get(event.connection_session_id);
            if (userSessionConnections) {
              await send(event, event.connection_session_id, userSessionConnections);
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      log.error("streamLine: error", error);
    }
  },
});

async function send(
  event: GlobalDealFrameworkMessage,
  connection_session_id: string,
  userSessionConnections: StreamInOut<StreamLineDefaultInMessage, StreamLineDefaultOutMessage>,
) {
  await userSessionConnections.send({
    user_id: event.user_id,
    connection_session_id: connection_session_id,
    service: "ws_core",
    response_type: "message",
    topic: event.topic,
    message_id: event.message_id ? event.message_id : crypto.randomUUID(),
    message: {
      status: "success",
    },
  });
}
