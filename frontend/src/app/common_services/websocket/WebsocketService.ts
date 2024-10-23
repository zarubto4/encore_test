import { WebSocketClientBackand } from './WebSocketClientBackand';
import * as Rx from 'rxjs';
import { EventEmitter } from '@angular/core';
import { ProjectBackend } from '../../backend/projectBackend.backend';
import { IWebSocketMessageToServer, IWebSocketRequestOptions } from './WebSocketMessageToServer';
import { IWebSocketMessageFromServer, WSMessageErrorResponse } from './WebSocketMessageFromServer';
import { models } from '../../backend/generated_api_from_backend/client';
import ServiceSubscribeListEnum = models.ServiceSubscribeListEnum;

export class WebsocketService {
  protected portalWebsocket: WebSocketClientBackand;
  public disconnectionEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  public connectionEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  public constructor(protected projectBackend: ProjectBackend) {
    console.log('WebsocketService::constructor');
  }

  /**
   * Send message, where you don't expect response.
   * @param message
   * @param options
   */
  public send(message: IWebSocketMessageToServer): void {
    if (this.portalWebsocket.isOpen()) {
      this.portalWebsocket.send(message);
    } else {
      console.warn('WebsocketService::send:: Attempt to send data to closed WebSocket');
    }
  }

  /**
   * Send message, where you expect response
   * @param message
   * @param options
   */
  public async sendWithResponse(
    message: IWebSocketMessageToServer,
    options?: IWebSocketRequestOptions
  ): Promise<IWebSocketMessageFromServer> {
    if (this.portalWebsocket) {
      return this.portalWebsocket.sendWithResponse(message, options);
    } else {
      await setTimeout(() => {
        // Do nothing
      }, 5000);
      if (this.portalWebsocket) {
        return this.portalWebsocket.sendWithResponse(message, options);
      } else {
        return new WSMessageErrorResponse(message, 'NO_OPEN_WS_CONNECTION');
      }
    }
  }

  /**
   * Return Backend Connection
   */
  public getBackandConnection(): WebSocketClientBackand {
    return this.portalWebsocket;
  }

  /**
   * Close Connection - Only For Developmen purpose
   */
  public closeBackandConnection(): void {
    if (typeof this.portalWebsocket !== 'undefined') {
      this.portalWebsocket.disconnect();
      this.portalWebsocket = null;
    }
  }

  /**
   * Return subscribe of Service and specific topic
   */
  public subscribe(service: ServiceSubscribeListEnum, topic: string): Rx.Subject<IWebSocketMessageFromServer> {
    const channel: Rx.Subject<IWebSocketMessageFromServer> = new Rx.Subject<IWebSocketMessageFromServer>();
    this.portalWebsocket.messages_steam.subscribe((message: IWebSocketMessageFromServer) => {
      if (message.service === service) {
        if (message.topic === topic) {
          channel.next(message);
        }
      }
    });
    return channel;
  }

  /**
   * Return subscribe of Service and all messages from this service
   */
  public subscribeAllMessageTypes(message_channel: ServiceSubscribeListEnum): Rx.Subject<IWebSocketMessageFromServer> {
    const channel: Rx.Subject<IWebSocketMessageFromServer> = new Rx.Subject<IWebSocketMessageFromServer>();
    this.portalWebsocket.messages_steam.subscribe((message: IWebSocketMessageFromServer) => {
      if (message.service === message_channel) {
        channel.next(message);
      }
    });
    return channel;
  }

  // Private -----------------------------------------------------------------------------------------------------------
  public openBackandConnection(url?: string): void {
    console.log('WebsocketService::openBackandConnection');
    if (!this.portalWebsocket) {
      console.log('WebsocketService::openBackandConnection:: no ws portal init yet');
      this.portalWebsocket = new WebSocketClientBackand(this.projectBackend, url);
      this.portalWebsocket.connect();

      this.portalWebsocket.connectionEvent.subscribe(() => {
        console.log('WebsocketService::openBackandConnection:connectionEvent:: emit connection');
        this.connectionEvent.emit(true);
      });

      this.portalWebsocket.disconnectionEvent.subscribe(() => {
        console.log('WebsocketService::openBackandConnection::connectionEvent:: emit disconnection');
        this.disconnectionEvent.emit(true);
      });
    } else {
      console.log('WebsocketService::openBackandConnection:: connected - create setTimeout');
      setTimeout(() => this.portalWebsocket.connect(), 500);
    }
  }
}
