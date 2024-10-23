import StreamLineDefaultOutMessage = models.StreamLineDefaultOutMessage;
import { IWebSocketMessageToServer } from './WebSocketMessageToServer';
import { models } from '../../backend/generated_api_from_backend/client';
import ServiceSubscribeListEnum = models.ServiceSubscribeListEnum;
import ServiceSubscribeResponseType = models.ServiceSubscribeResponseType;

// eslint-disable-next-line  @typescript-eslint/no-empty-object-type
export interface IWebSocketMessageFromServer extends StreamLineDefaultOutMessage {}

export class WebSocketMessageFromServer implements IWebSocketMessageFromServer {
  connection_session_id: string;
  user_id: string;
  response_type: ServiceSubscribeResponseType;
  service: ServiceSubscribeListEnum;
  topic: string;
  message_id: string; // UUID
  message: object;

  constructor(msg: IWebSocketMessageFromServer) {
    this.connection_session_id = msg.connection_session_id;
    this.user_id = msg.user_id;
    this.response_type = msg.response_type;
    this.message_id = msg.message_id;
    this.service = msg.service;
    this.topic = msg.topic;
    this.message = msg.message;
  }

  public isSuccessful(): boolean {
    return this.message['status'] === 'success'; // We have a deal with backend that everything what required "Success response" is in this form
  }
}

/***********************************************************************************************************************
 *                                                                                                                     *
 *  PREDEFINED MESSAGES                                                                                                *
 *                                                                                                                     *
 **********************************************************************************************************************/

export class WSMessageErrorResponse implements IWebSocketMessageFromServer {
  connection_session_id: string = null;
  user_id: string = null;
  service: ServiceSubscribeListEnum;
  message_id: string;
  response_type: ServiceSubscribeResponseType;
  topic: string;
  message: { error: string } = {
    error: 'Error'
  };

  constructor(message: IWebSocketMessageToServer, error_message: string) {
    this.service = message.service;
    this.message_id = message.message_id;
    this.topic = message.topic;
    this.message.error = error_message;
  }
}
