// Used to pass initial data, optional.
import { ServiceSubscribeListEnum } from "../encore.service";

export type ResponseType = "confirmation" | "message" | "message_with_expected_response";

export interface StreamLineDefaultHandshake {
  readonly userId: string;
  readonly connectionSessionId: string;
}

export interface StreamLineDefaultInMessage {
  readonly service: ServiceSubscribeListEnum;
  readonly messageId: string;
  readonly type: ResponseType;
  message: {
    topic: string;
    content: unknown;
  };
}

export interface StreamLineDefaultOutMessage {
  connectionSessionId: string;
  userId: string;
  service: ServiceSubscribeListEnum;
  type: ResponseType;
  messageId: string;
  message?: {
    topic: string;
    content: unknown;
  } | null;
}

export class MessageConfirmation {
  connectionSessionId: string;
  userId: string;
  service: ServiceSubscribeListEnum;
  messageId: string;
  type: ResponseType = "confirmation";
  constructor(message: StreamLineDefaultInMessage, shake: StreamLineDefaultHandshake) {
    this.messageId = message.messageId;
    this.service = message.service;
    this.userId = shake.userId;
    this.connectionSessionId = shake.connectionSessionId;
  }
}
