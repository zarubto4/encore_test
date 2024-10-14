import { Subscription } from "encore.dev/pubsub";
import { connectedStreams, streamLine_sub_clientMessage } from "../encore.service";
import log from "encore.dev/log";
import { ServiceSubscribeListEnum } from "../models/request_models.models";

// ---  Send Messages To Client  ---------------------------------------------------------------------------------------

export interface SendMessageToClient {
  userId: string;
  connectionSessionId?: string; // Optional!
  service: ServiceSubscribeListEnum;
  messageId?: string; // UUID - Always optional
  type?: "message" | "message_with_expected_response"; // Always optional
  message: {
    topic: string;
    content: unknown;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const streamLine = new Subscription(streamLine_sub_clientMessage, "gatewayService-streamLine-sendToClient", {
  handler: async (event) => {
    try {
      log.trace("streamLine: incoming message for WebSocket", { ...event, user_connected: connectedStreams.has(event.userId) });
      if (connectedStreams.has(event.userId)) {
        const userConnections = connectedStreams.get(event.userId);
        if (userConnections) {
          if (!event.connectionSessionId) {
            for (const [connectionId, stream] of userConnections) {
              await stream.send({
                userId: event.userId,
                connectionSessionId: connectionId,
                service: event.service,
                type: event.type ? event.type : "message",
                messageId: event.messageId ? event.messageId : crypto.randomUUID(),
                message: event.message,
              });
            }
          } else {
            const userSessionConnections = userConnections.get(event.connectionSessionId);
            if (userSessionConnections) {
              await userSessionConnections.send({
                userId: event.userId,
                connectionSessionId: event.connectionSessionId,
                service: event.service,
                type: event.type ? event.type : "message",
                messageId: event.messageId ? event.messageId : crypto.randomUUID(),
                message: event.message,
              });
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
