import { WebSocketClient } from './WebSocketClient';
import { IWebSocketMessageToServer, IWebSocketRequestOptions } from './WebSocketMessageToServer';
import { IWebSocketMessageFromServer } from './WebSocketMessageFromServer';

export class WebSocketRequest {
  protected client: WebSocketClient;
  protected message: IWebSocketMessageToServer;

  protected delay = 0;
  protected tries = 3;
  protected timeout = 5000;

  protected resolveCallback: (message: IWebSocketMessageFromServer) => void;
  protected catchCallback: (reason) => void;
  protected completedCallback: (id: string) => void;

  protected timeoutTimer;

  constructor(client: WebSocketClient, message: IWebSocketMessageToServer, options?: IWebSocketRequestOptions) {
    this.client = client;
    this.message = message;

    if (!this.message.message_id) {
      this.message.message_id = crypto.randomUUID();
    }

    if (options) {
      if (options.delay) {
        this.delay = options.delay;
      }

      if (options.tries) {
        this.tries = options.tries;
      }

      if (options.timeout) {
        this.timeout = options.timeout;
      }
    }
  }

  public onCompleted(callback: (id: string) => void): void {
    this.completedCallback = callback;
  }

  public send(): Promise<IWebSocketMessageFromServer> {
    return new Promise<IWebSocketMessageFromServer>((resolve1, reject1) => {
      this.resolveCallback = resolve1;
      this.catchCallback = reject1;

      if (this.delay > 0) {
        setTimeout(() => {
          this.doSend();
        }, this.delay);
      } else {
        this.doSend();
      }
    });
  }

  public resolve(response: IWebSocketMessageToServer) {
    if (this.completedCallback) {
      this.completedCallback(this.message.message_id);
    }
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }
    if (this.resolveCallback) {
      this.resolveCallback(response as IWebSocketMessageFromServer);
    }
  }

  public reject(reason) {
    if (this.completedCallback) {
      this.completedCallback(this.message.message_id);
    }
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }
    if (this.catchCallback) {
      this.catchCallback(reason);
    }
  }

  protected doSend() {
    if (this.tries > 0) {
      this.tries--;

      if (this.timeoutTimer) {
        clearTimeout(this.timeoutTimer);
      }

      // this.timeoutTimer = this.delayFunction(this.timeout).then((val) => {
      // 	console.warn('WebSocketRequest: timeout try again:', this.timeout);
      // 	this.doSend();
      // });

      try {
        this.timeoutTimer = setTimeout(() => {
          try {
            this.doSend.bind(this);
          } catch (error) {
            console.warn('WebSocketRequest::doSend:: error:', error);
          }
        }, this.timeout);
      } catch (error) {
        console.error('WebSocketRequest::doSend:: error:', error);
        // Do nothing?
      }

      this.client.send(this.message);
    } else {
      this.reject('timeout');
    }
  }

  protected delayFunction(t, val) {
    return new Promise((resolve) => {
      try {
        setTimeout(resolve, t, val);
      } catch (error) {
        // error??
      }
    });
  }
}
