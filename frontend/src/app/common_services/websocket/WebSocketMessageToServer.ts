import { models } from '../../backend/generated_api_from_backend/client';
import ServiceSubscribeListEnum = models.ServiceSubscribeListEnum;
import ServiceSubscribeResponseType = models.ServiceSubscribeResponseType;

export interface IWebSocketMessageToServer {
  response_type?: ServiceSubscribeResponseType;
  message_id?: string;
  service: ServiceSubscribeListEnum;
  topic: string;
  message: object;
}

export class WebSocketMessageToServer implements IWebSocketMessageToServer {
  service: ServiceSubscribeListEnum;
  message_id?: string;
  response_type: ServiceSubscribeResponseType;
  topic: string;
  message: object;

  constructor(
    service: ServiceSubscribeListEnum,
    topic: string,
    response_type: ServiceSubscribeResponseType = 'message',
    message: object = {}
  ) {
    this.service = service;
    this.topic = topic;
    this.message = message;
    this.response_type = response_type;
  }

  public print(): string {
    return JSON.stringify(this.message);
  }
}

export interface IWebSocketRequestOptions {
  delay?: number;
  tries?: number;
  timeout?: number; // In milis
}

/***********************************************************************************************************************
 *                                                                                                                     *
 *  PREDEFINED MESSAGES                                                                                                *
 *                                                                                                                     *
 **********************************************************************************************************************/

export class WSMessageSubscribeNotification implements IWebSocketMessageToServer {
  service: ServiceSubscribeListEnum = 'ws_core';
  topic = 'notification_subscription';
  message: object = {};
}

export class WSMessageUnsubscribeNotification implements IWebSocketMessageToServer {
  service: ServiceSubscribeListEnum = 'ws_core';
  topic = 'notification_unsubscription';
  message: object = {};
}
