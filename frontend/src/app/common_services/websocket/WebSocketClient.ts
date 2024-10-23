import { WebSocketRequest } from './WebSocketRequest';
import * as Rx from 'rxjs';
import { EventEmitter } from '@angular/core';
import { IWebSocketMessageToServer, IWebSocketRequestOptions } from './WebSocketMessageToServer';
import { IWebSocketMessageFromServer, WebSocketMessageFromServer } from './WebSocketMessageFromServer';

export abstract class WebSocketClient {
  // Private Values ----------------------------------------------------------------------------------------------------

  private _url: string;
  protected webSocket: WebSocket;
  protected messageBuffer: Record<string, WebSocketRequest> = {};
  private reconnectTimeout; // Timeout

  public messages: Rx.Subject<WebSocketMessageFromServer>;
  public webSocketState: Rx.Subject<'open' | 'close'> = new Rx.Subject<'open' | 'close'>();

  public disconnectionEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  public connectionEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Events ------------------------------------------------------------------------------------------------------------

  public onOpened: () => void;
  protected boundOnOpen: EventListener;
  public boundOnClose: EventListener;
  protected boundOnError: EventListener;
  protected boundDispatch: EventListener;

  // Constructor -------------------------------------------------------------------------------------------------------
  protected constructor() {
    this.messages = new Rx.Subject<WebSocketMessageFromServer>();
  }

  set url(url: string) {
    console.log('WebSocketClient::url:: set:', url);
    if (this.webSocket) {
      console.log('WebSocketClient::url:: websocket already open.Try to close');
      this.webSocket.close();
    }
    this._url = url;
  }
  get url() {
    return this._url;
  }

  public connect(): void {
    if (this._url && this.webSocket == null) {
      this.webSocket = new WebSocket(this._url);
      this.boundOnOpen = this.onOpen.bind(this);
      this.boundOnClose = this.onClose.bind(this);
      this.boundOnError = this.onError.bind(this);
      this.boundDispatch = this.dispatch.bind(this);
      this.webSocket.addEventListener('open', this.boundOnOpen);
      this.webSocket.addEventListener('close', this.boundOnClose);
      this.webSocket.addEventListener('error', this.boundOnError);
      this.webSocket.addEventListener('message', this.boundDispatch);
    }
  }

  // Close connection - only for development purpose!
  public disconnect(): void {
    console.log('WebSocketClient: disconnect');

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.disconnectionEvent.emit(true);

    if (this.webSocket) {
      this.webSocket.removeEventListener('open', this.boundOnOpen);
      this.webSocket.removeEventListener('close', this.boundOnClose);
      this.webSocket.removeEventListener('error', this.boundOnError);
      this.webSocket.removeEventListener('message', this.boundDispatch);

      this.webSocket.close();
    }
  }

  public send(message: IWebSocketMessageToServer): void {
    console.log('WebSocketClient::send::message', message);
    if (this.isOpen()) {
      if (!message.response_type) {
        message.response_type = 'message';
      }

      if (!message.message_id) {
        message.message_id = crypto.randomUUID();
      }

      this.webSocket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocketClient::send - Attempt to send data to closed WebSocket');
    }
  }

  public async sendWithResponse(
    message: IWebSocketMessageToServer,
    options?: IWebSocketRequestOptions
  ): Promise<IWebSocketMessageFromServer> {
    console.log('WebSocketClient:sendWithResponse: try to send Message: ', message);

    message.response_type = 'message_with_expected_response';

    const request: WebSocketRequest = new WebSocketRequest(this, message, options);
    console.log('WebSocketClient:sendWithResponse: try to send Request: ', request);

    if (this.messageBuffer[message.message_id]) {
      console.log('WebSocketClient::sendWithResponse: messageBuffer contains message already');
      return null;
    }

    this.messageBuffer[message.message_id] = request;
    console.log('WebSocketClient::sendWithResponse: ass to messageBuffer under Message ID', message.message_id);

    request.onCompleted((id: string) => {
      console.log('WebSocketClient::sendWithResponse:: onCompleted - id', id, 'message_id:', message.message_id);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.messageBuffer[message.message_id];
    });

    return request.send();
  }

  public isOpen(): boolean {
    return this.webSocket && this.webSocket.readyState === WebSocket.OPEN;
  }

  protected onOpen(event) {
    console.log('WebSocketClient::onOpen:: event', event);
    if (this.onOpened) {
      this.onOpened();
    }
    this.webSocketState.next('open');
    this.connectionEvent.emit(true);
  }

  protected onError(event) {
    console.error('WebSocketClient::onError:: event', event);
  }

  protected onClose(event) {
    console.warn('WebSocketClient::onClose:: event', event);
    this.webSocketState.next('close');
    this.webSocket = null;
    this.disconnectionEvent.emit(true);
    this.reconnectAfterTimeout();
  }

  protected dispatch(event): void {
    try {
      console.log('WebSocketClient::dispatch:: data', event.data);
      const message: IWebSocketMessageFromServer = JSON.parse(event.data);

      console.log('WebSocketClient::dispatch:: onCompleted what we have in buffer:', this.messageBuffer[message.message_id]);

      if (Object.prototype.hasOwnProperty.call(this.messageBuffer, message.message_id)) {
        console.log('WebSocketClient::dispatch:: bingo - buffer contains message callback!', event.data);
        this.messageBuffer[message.message_id].resolve(message);
      } else {
        console.log('WebSocketClient::dispatch:: no its new message', event.data);
        this.onMessage(message as WebSocketMessageFromServer);
        this.messages.next(message as WebSocketMessageFromServer);
      }
    } catch (error) {
      console.error(error);
    }
  }

  protected reconnectAfterTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  protected abstract onMessage(message: WebSocketMessageFromServer);
}
