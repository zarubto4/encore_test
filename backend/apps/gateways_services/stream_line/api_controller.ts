import { StreamLineDefaultHandshake, MessageConfirmation, StreamLineDefaultOutMessage, StreamLineDefaultInMessage } from "./security/request_models.models";
import { connectedStreams } from "./encore.service";
import { dealDraftCreation_dealDraftWs } from "../../globalDealFramework_services/dealDraftCreation/encore.service";
import { api, StreamInOut } from "encore.dev/api";

/**
 * All Supported Services
 * 👾👾👾 For Developers ⇒ Please Extend only part defined by these Emojis 👾!
 *
 * ## neverEndingStream: The stream object is an AsyncIterator that yields incoming messages.
 * The loop will continue as long as the client keeps the connection open.
 */

export const chat = api.streamInOut<StreamLineDefaultHandshake, StreamLineDefaultInMessage, StreamLineDefaultOutMessage>(
  { expose: true, auth: false, path: "/websocket" },
  async (handshake, neverEndingStream) => {
    validAndRegisterHandshake(handshake);
    registerHandshake(handshake, neverEndingStream);

    try {
      for await (const chatMessage of neverEndingStream) {
        switch (chatMessage.service) {
          case "global_deal_framework": {
            await dealDraftCreation_dealDraftWs.publish({ ...chatMessage, ...handshake });
            break;
          }
        }
        // Always send receive confirmation for an incoming message
        if (chatMessage.type != "message") {
          await neverEndingStream.send(new MessageConfirmation(chatMessage, handshake));
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      removeHandshake(handshake);
    }
    removeHandshake(handshake);
  }
);

// --- Support Methods -------------------------------------------------------------------------------------------------

/**
 * Register Connection To global Map. User ID is first Map, second is Connection ID.
 * We are supporting multiple connections with the same USER_ID!
 */
function registerHandshake(handshake: StreamLineDefaultHandshake, stream: StreamInOut<StreamLineDefaultInMessage, StreamLineDefaultOutMessage>): void {
  if (!connectedStreams.has(handshake.userId)) {
    connectedStreams.set(handshake.userId, new Map());
    connectedStreams.get(handshake.userId)?.set(handshake.connectionSessionId, stream);
  } else {
    connectedStreams.get(handshake.userId)?.set(handshake.connectionSessionId, stream);
  }
}

function removeHandshake(handshake: StreamLineDefaultHandshake): void {
  if (connectedStreams.has(handshake.userId)) {
    const userConnection = connectedStreams.get(handshake.userId);
    if (userConnection && userConnection.has(handshake.connectionSessionId)) {
      userConnection.delete(handshake.connectionSessionId); // In case of error - remove connection
    }
    if (userConnection && userConnection.size < 1) {
      connectedStreams.delete(handshake.userId); // In case of error - remove connection
    }
  }
}

function validAndRegisterHandshake(handshake: StreamLineDefaultHandshake): void {
  // Todo something
  console.log("handshake", handshake);
}
