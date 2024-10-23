import { Injectable } from '@angular/core';
import { WebsocketService } from '../common_services/websocket/WebsocketService';
import Client from './generated_api_from_backend/client';

@Injectable()
export class ProjectBackend {
  public host = null;
  public backend_url = null;
  public protocol = 'https:';
  public wsProtocol: 'wss' | 'ws' = 'wss';
  public websocketService: WebsocketService = null;
  public client: Client = null;

  constructor() {
    this.setUrl();
    // Log into System
    this.setRestApiClient().then(() => {
      // Connect to Websocket
      this.setWebsocket();
    });
  }

  // Set Website URL - Backend URL, and protocol. It's first Job
  private setUrl() {
    if (location.protocol === 'https:') {
      this.wsProtocol = 'wss';
      this.protocol = 'https';
      this.host = 'www.groupon.com/g_core';
    } else {
      this.wsProtocol = 'ws';
      this.protocol = 'http';
      this.backend_url = 'localhost:4000';
    }
  }

  // Set Website URL - Backend URL, and protocol. It's first Job
  private async setRestApiClient() {
    this.client = new Client(this.backend_url, {
      auth: {
        bToken: await this.isAuthorized()
      }
    });
  }

  // Set and Open Websocket - But only if user is assigned and validated
  private setWebsocket() {
    this.websocketService = new WebsocketService(this);
    this.websocketService.openBackandConnection();
  }

  public async isAuthorized(): Promise<string> {
    return 'XXX';
  }
}
