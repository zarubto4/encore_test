import {
  StreamLineDefaultHandshake,
  MessageConfirmation,
  StreamLineDefaultOutMessage,
  StreamLineDefaultInMessage,
  WelcomeMessage,
  StreamLineValidatedAndFilledHandshake,
} from "./models/request_models.models";
import { connectedStreams } from "./encore.service";
import {
  dealDraftCreation_dealDraftWs,
  userNotification_notificationsWs,
} from "../../globalDealFramework_services/dealDraftCreation/encore.service";
import { api, StreamInOut } from "encore.dev/api";
import { gatewayService_rbac } from "~encore/clients";
import log from "encore.dev/log";
import { StreamNessage } from "./models/streamLine.models";

/**
 * All Supported Services
 * 👾👾👾 For Developers ⇒ Please Extend only part defined by these Emojis 👾!
 *
 * ## neverEndingStream: The stream object is an AsyncIterator that yields incoming messages.
 * The loop will continue as long as the client keeps the connection open.
 */
export const websocket = api.streamInOut<StreamLineDefaultHandshake, StreamLineDefaultInMessage, StreamLineDefaultOutMessage>(
  { expose: true, auth: false, path: "/websocket" },
  async (handshake, neverEndingStream) => {
    log.trace("websocket::connect:: handshake", handshake);

    const validatedHandshake: StreamLineValidatedAndFilledHandshake | null = await validAndRegisterIncomingConnection(
      handshake,
      neverEndingStream,
    );

    log.trace("websocket::connect:: validatedHandshake", validatedHandshake);

    // User is not valid
    if (!validatedHandshake) {
      log.debug("websocket::connect:: validatedHandshake - not Valid return false");
      return;
    }

    try {
      for await (const chatMessage of neverEndingStream) {
        const streamMessage = new StreamNessage(chatMessage, validatedHandshake);

        switch (chatMessage.service) {
          /**
           *
           *
           *
           */
          // 👾👾👾 START HERE 👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾 //

          case "global_deal_framework": {
            await dealDraftCreation_dealDraftWs.publish(streamMessage);
            break;
          }

          case "ws_core": {
            console.log("Posílám na notifikační kanál!");
            await userNotification_notificationsWs.publish(streamMessage);
            break;
          }

          // 👾👾👾 END HERE 👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾👾 //
          /**
           *
           *
           *
           */
        }
        // Always send receive confirmation for an incoming message
        if (chatMessage.response_type == "message") {
          await neverEndingStream.send(new MessageConfirmation(chatMessage, validatedHandshake));
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      removeHandshake(validatedHandshake);
    }
    removeHandshake(validatedHandshake);
  },
);

// --- Support Methods -------------------------------------------------------------------------------------------------

async function validAndRegisterIncomingConnection(
  handshake: StreamLineDefaultHandshake,
  neverEndingStream: StreamInOut<StreamLineDefaultInMessage, StreamLineDefaultOutMessage>,
): Promise<StreamLineValidatedAndFilledHandshake | null> {
  console.log();

  const user = await gatewayService_rbac.convertUserBToken({
    b_token: handshake.b_token,
  });

  // User is not valid
  if (user.error || !user.success) {
    return null;
  }

  const validHandshake: StreamLineValidatedAndFilledHandshake = {
    user_id: user.success.user_id,
    b_token: handshake.b_token,
    connection_session_id: crypto.randomUUID(),
  };

  registerHandshake(validHandshake, neverEndingStream);

  // Send a Welcome message
  await neverEndingStream.send(new WelcomeMessage(validHandshake));

  return validHandshake;
}

/**
 * Register Connection To global Map. User ID is first Map, second is Connection ID.
 * We are supporting multiple connections with the same USER_ID!
 */
function registerHandshake(
  handshake: StreamLineValidatedAndFilledHandshake,
  stream: StreamInOut<StreamLineDefaultInMessage, StreamLineDefaultOutMessage>,
): void {
  if (!connectedStreams.has(handshake.user_id)) {
    connectedStreams.set(handshake.user_id, new Map());
    connectedStreams.get(handshake.user_id)?.set(handshake.connection_session_id, stream);
  } else {
    connectedStreams.get(handshake.user_id)?.set(handshake.connection_session_id, stream);
  }
}

function removeHandshake(handshake: StreamLineValidatedAndFilledHandshake): void {
  if (connectedStreams.has(handshake.user_id)) {
    const userConnection = connectedStreams.get(handshake.user_id);
    if (userConnection && userConnection.has(handshake.connection_session_id)) {
      userConnection.delete(handshake.connection_session_id); // In case of error - remove connection
    }
    if (userConnection && userConnection.size < 1) {
      connectedStreams.delete(handshake.user_id); // In case of error - remove connection
    }
  }
}
