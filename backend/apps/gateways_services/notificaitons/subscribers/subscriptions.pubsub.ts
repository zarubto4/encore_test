import { Subscription } from "encore.dev/pubsub";
import { connectedStreams } from "../encore.service";
import log from "encore.dev/log";
import { userNotification_notificationsWs } from "../../../globalDealFramework_services/dealDraftCreation/encore.service";
import { streamLine_sub_clientMessage } from "../../streamLine/encore.service";
import { StreamResponse } from "../../streamLine/models/streamLine.models";

// ---  Subscribing and collection all websockets subscribing notifications  -------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const streamLine = new Subscription(userNotification_notificationsWs, "gatewayService-streamLine-sendToClient", {
  handler: async (event) => {
    try {
      log.trace("streamLine: incoming message for WebSocket", {
        ...event,
        subscription: "gatewayService-streamLine-sendToClient",
        user_connected: connectedStreams.has(event.user_id),
      });

      const userConnections = connectedStreams.get(event.user_id);

      if (userConnections == null) {
        connectedStreams.set(event.user_id, [event.connection_session_id]);
      } else {
        userConnections.push(event.connection_session_id);
      }

      await streamLine_sub_clientMessage.publish(
        new StreamResponse(event, {
          status: "success",
        }),
      );
    } catch (error) {
      console.log(error);
      log.error("streamLine: error", error);
    }
  },
});
