import {
  ServiceSubscribeListEnum,
  ServiceSubscribeResponseType,
  StreamLineDefaultInMessage,
  StreamLineValidatedAndFilledHandshake,
} from "./request_models.models";
import { SendMessageToClient } from "../subscribers/subscriptions.pubsub";

export interface IStreamOneTimeResponse {
  user_id: string;
  connection_session_id: string;
  service: ServiceSubscribeListEnum;
  message_id: string;
  topic: string;
  message: unknown;
}

export class StreamResponse implements SendMessageToClient {
  user_id: string;
  connection_session_id?: string; // Optional!
  service: ServiceSubscribeListEnum;
  message_id?: string; // UUID - Always optional
  type?: ServiceSubscribeResponseType; // Always optional
  topic: string;
  message: unknown;

  constructor(origin: IStreamOneTimeResponse, msg: unknown) {
    this.user_id = origin.user_id;
    this.connection_session_id = origin.connection_session_id;
    this.service = origin.service;
    this.message_id = origin.message_id;
    this.type = "confirmation";
    this.topic = origin.topic;
    this.message = msg;
  }
}

export class StreamNessage implements IStreamOneTimeResponse {
  user_id: string;
  connection_session_id: string;
  service: ServiceSubscribeListEnum;
  message_id: string;
  topic: string;
  message: unknown;

  constructor(original_message: StreamLineDefaultInMessage, valid_handshake: StreamLineValidatedAndFilledHandshake) {
    this.user_id = valid_handshake.user_id;
    this.connection_session_id = valid_handshake.connection_session_id;
    this.service = original_message.service;
    this.message_id = original_message.message_id;
    this.topic = original_message.topic;
    this.message = original_message.message;
  }

  /*
  // Send Message
  public respond(message: unknown): Promise<void> {
    if (!this.multiple_response_allowed && this.message_send) {
      throw new Error("Multiple responses are forbidden");
    }

    this.message_send = true;
    const response: StreamLineDefaultOutMessage = {
      connection_session_id: this.valid_handshake.connection_session_id,
      user_id: this.valid_handshake.user_id,
      message_id: this.original_message.message_id,
      service: this.original_message.service,
      topic: this.original_message.topic,
      message: message,
      response_type: "confirmation",
    };

    log.trace("StreamOneTimeResponse: respond", response);
    return this.stream.send(response);
  }
  */
}
