import {WEBSOCKET_PASSWORD, WEBSOCKET_URL} from '../shared/constants';
import {WsRequest} from './types';
import VertoNotification from './VertoNotification';
import {SendWsRequest} from '../pages/WatchParty/types';

export default class VertoWebsocket {
  private readonly notifications: VertoNotification;
  private readonly sessionId: string;
  private readonly fsUrl: string;
  private readonly moderatorUsername: string;
  private readonly moderatorPassword: string;
  private wsRequestId = 0;
  private reconnectAttempts = 0;
  private isDisconnected = false;
  private _websocket: WebSocket;
  private reconnectingNotificationSend = false;

  constructor(
    sessionId: string,
    notifications: VertoNotification,
    moderatorUsername?: string,
    moderatorPassword?: string,
    fsUrl?: string
  ) {
    this.sessionId = sessionId;
    this.notifications = notifications;
    this.fsUrl = fsUrl || WEBSOCKET_URL;
    const loginUrl = this.fsUrl.replace('wss://', '').replace('/', '');
    this.moderatorUsername = moderatorUsername || `1008@${loginUrl}`;
    this.moderatorPassword = moderatorPassword || WEBSOCKET_PASSWORD;
    this._websocket = new WebSocket(this.fsUrl);
    this.initWs();
    this.notifications.sendWsRequest.subscribe(this.publish.bind(this));
    window.addEventListener('online', this.onlineListener.bind(this));
  }

  get websocket() {
    return this._websocket;
  }

  disconnect() {
    this.isDisconnected = true;
    this._websocket.close();
  }

  reconnect() {
    this.isDisconnected = false;
    console.log('Reconnecting websocket');
    this.initWs(true);
  }

  private initWs(reconnecting?: boolean) {
    if (reconnecting) {
      if (!this.reconnectingNotificationSend) {
        this.notifications.onWebsocketReconnecting.notify(null);
        this.reconnectingNotificationSend = true;
      }

      this._websocket = new WebSocket(this.fsUrl);
    }

    this._websocket.onopen = () => {
      if (reconnecting) {
        this.notifications.onWebsocketReconnected.notify(null);
      }

      this.reconnectAttempts = 0;
      this.reconnectingNotificationSend = false;

      this.publish({
        method: 'login',
        params: {
          login: this.moderatorUsername,
          passwd: this.moderatorPassword
        },
        onSuccess: () => {
          this.notifications.onFSLogged.notify(null)
        },
        onError: (err) => {
          this.notifications.onFSLoggedError.notify(null);
          console.error('Error while login', err);
        },
      });
    };

    this._websocket.onmessage = (event: MessageEvent) => {
      if (/^#SP/.test(event.data)) {
        this.notifications.onWebSocketTestSpeedMessage.notify(event);
        return;
      }
      try  {
        const message = JSON.parse(event.data) || {};
        this.notifications.onWebSocketMessage.notify(message);
      } catch (e: any) {
        console.error('Could not parse websocket data', e);
      }
    };

    this._websocket.onclose = ({ code }: CloseEvent) => {
      if (code !== 1000 && !this.isDisconnected && this.reconnectAttempts < 100 && navigator.onLine) {
        setTimeout(() => this.initWs(true), 1000);
        console.log('WebSocket closed, attempting to reconnect');
        this.reconnectAttempts++;
      } else {
        window.removeEventListener('online', this.onlineListener.bind(this));
      }
    };
  }

  private publish({ method, params, onSuccess, onError }: SendWsRequest) {
    const request: WsRequest = {
      jsonrpc: '2.0',
      method,
      params: { sessid: this.sessionId, ...params },
      id: ++this.wsRequestId,
    };

    const requestStringify = JSON.stringify(request);

    if (this._websocket.readyState === WebSocket.OPEN) {
      this._websocket.send(requestStringify);
      this.notifications.onNewWebsocketMessageRequest.notify({ request, onSuccess, onError });
    }
  }

  private onlineListener () {
    if (!this._websocket || this._websocket.readyState === WebSocket.CLOSED) {
      this.initWs(true);
    }
  }
}
