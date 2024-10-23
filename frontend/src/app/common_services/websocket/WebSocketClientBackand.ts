import { WebSocketClient } from './WebSocketClient';
import * as Rx from 'rxjs';
import { ProjectBackend } from '../../backend/projectBackend.backend';
import { IWebSocketMessageFromServer, WebSocketMessageFromServer } from './WebSocketMessageFromServer';
import { WSMessageSubscribeNotification, WSMessageUnsubscribeNotification } from './WebSocketMessageToServer';

export class WebSocketClientBackand extends WebSocketClient {
  public messages_steam: Rx.Subject<IWebSocketMessageFromServer> = new Rx.Subject<IWebSocketMessageFromServer>();
  private connection_session_id: string;
  private pingInterval;

  constructor(
    protected backend: ProjectBackend,
    protected optionalUrl?: string
  ) {
    super();
    console.log(
      'WebSocketClientBackand::init:: optionalUrl:',
      optionalUrl,
      'default url:',
      backend.wsProtocol + '://' + backend.backend_url + '/websocket/'
    );
  }

  public override async connect(): Promise<void> {
    try {
      const b_token = await this.backend.isAuthorized();
      if (b_token) {
        console.log('WebSocketClientBackand::connect:: isAuthorized with b_token:', b_token);
        this.url = this.optionalUrl
          ? this.optionalUrl
          : this.backend.wsProtocol + '://' + this.backend.backend_url + '/websocket?b_token=' + b_token;
        console.log('WebSocketClientBackand::connect:: try to connect final url: ', this.url);
        super.connect();
      } else {
        console.log('WebSocketClientBackand::connect:: is not Authorized b_token ios missing');
        this.url = null;
        this.reconnectAfterTimeout();
      }
    } catch (e) {
      console.log('WebSocketClientBackand::connect:: error::', e);
      setTimeout(() => {
        this.connect();
      }, 2000);
    }
  }

  public override disconnect(): void {
    this.url = null;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    super.disconnect();
    this.webSocket = null;
  }

  protected override onOpen(event): void {
    console.log('WebSocketClientBackand::onOpen:: event:', event);
    super.onOpen(event);
  }

  protected override onClose(event): void {
    console.log('WebSocketClientBackand::onClose:: ', event);
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    super.onClose(event);
  }

  protected onMessage(message: IWebSocketMessageFromServer): void {
    console.log('WebSocketClientBackand::onMessage::message', message);

    if (message.service === 'ws_core') {
      this.onWsCoreMessage(message);
    }

    this.messages_steam.next(message);
  }

  //

  private onWsCoreMessage(message: IWebSocketMessageFromServer): void {
    // Ignore Ping Messages
    if (message.service === 'ws_core' && message.topic == 'ping') {
      return;
    }

    // Do we have some implementation for Core Websocket function?
    // Subscribe Notifications
    if (message.service === 'ws_core' && message.topic == 'assign_connection_id') {
      console.log(
        'WebSocketClientBackand::onWsCoreMessage::assign_connection_id, time to subscribe Notifications:',
        message.connection_session_id
      );
      this.connection_session_id = message.connection_session_id;

      this.requestNotificationsSubscribe()
        .then((message: IWebSocketMessageFromServer) => {
          const msg = new WebSocketMessageFromServer(message);
          console.log('WebSocketClientBackand::onWsCoreMessage:: requestNotificationsSubscribe: response:', message);
          if (!msg.isSuccessful()) {
            console.error('WebSocketClientBackand::onWsCoreMessage:: - notification subscription failed');
          } else {
            console.log('WebSocketClientBackand::onWsCoreMessage:: subscription success');
          }
        })
        .catch((reason) => {
          console.error('WebSocketClientBackand::onOpen:: - error', reason);
          // TODO maybe reconnect?
        });
      return;
    }
  }

  private requestNotificationsSubscribe(): Promise<IWebSocketMessageFromServer> {
    return this.sendWithResponse(new WSMessageSubscribeNotification(), { timeout: 5000 });
  }

  private requestNotificationsUnsubscribe(): Promise<IWebSocketMessageFromServer> {
    return this.sendWithResponse(new WSMessageUnsubscribeNotification(), { timeout: 5000 });
  }
}
