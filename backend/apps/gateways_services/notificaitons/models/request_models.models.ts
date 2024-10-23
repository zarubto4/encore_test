// Used to pass initial data, optional.

export type ServiceSubscribeResponseType = "confirmation" | "message" | "message_with_expected_response";
export type ServiceSubscribeListEnum = "ws_core" | "global_deal_framework";

// Object that is used as "Login for Websocket"
export interface StreamLineDefaultHandshake {
  readonly b_token: string;
}

// After RBAC valid and convert bToken to user
export interface StreamLineValidatedAndFilledHandshake {
  readonly user_id: string;
  readonly b_token: string;
  readonly connection_session_id: string;
}

export interface StreamLineDefaultInMessage {
  readonly response_type: ServiceSubscribeResponseType;
  readonly message_id: string;

  readonly service: ServiceSubscribeListEnum;
  readonly topic: string;

  readonly message: unknown;
}

// Default message ----------------------------------------------------------------------------------------------------
export interface StreamLineDefaultOutMessage {
  // Mandatory - Who
  connection_session_id: string; // Uniq value for every websocket thread
  user_id: string; // User ID

  // Mandatory Expected behavior
  response_type: ServiceSubscribeResponseType;
  message_id: string;

  // Service and service Topic
  service: ServiceSubscribeListEnum;
  topic: string;
  message: unknown;
}

// Confirmation message ------------------------------------------------------------------------------------------------
export class MessageConfirmation {
  connection_session_id: string;
  user_id: string;

  response_type: ServiceSubscribeResponseType = "confirmation";
  message_id: string;

  service: ServiceSubscribeListEnum;
  topic = "confirmation";

  // Default Object
  message = {};

  constructor(message: StreamLineDefaultInMessage, shake: StreamLineValidatedAndFilledHandshake) {
    this.message_id = message.message_id ? message.message_id : crypto.randomUUID();
    this.service = message.service;
    this.user_id = shake.user_id;
    this.connection_session_id = shake.connection_session_id;
  }
}

// Welcome message -----------------------------------------------------------------------------------------------------
export class WelcomeMessage {
  connection_session_id: string;
  user_id: string;

  message_id: string = crypto.randomUUID();
  response_type: ServiceSubscribeResponseType = "message";

  service: ServiceSubscribeListEnum = "ws_core";
  topic = "assign_connection_id";

  // Default Object
  message = {};

  constructor(shake: StreamLineValidatedAndFilledHandshake) {
    this.user_id = shake.user_id;
    this.connection_session_id = shake.connection_session_id;
  }
}
