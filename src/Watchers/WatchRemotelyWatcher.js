import { SimpleWatcher } from './SimpleWatcher.js';

const EVENT_TYPE_MAP = {
  add: 'create',
  change: 'update',
  unlink: 'remove',
};

/* eslint-disable no-new-func */
const __global = (new Function('return this'))();
/* eslint-enable no-new-func */

const WebSocket          = __global.WebSocket;
const isSecureConnection = __global.location && __global.location.protocol === 'https:';

export class WatchRemotelyWatcher extends SimpleWatcher {

  constructor(params) {
    const options = WatchRemotelyWatcher._normalizeParameters(params);

    super(options);

    this._webSocket = options.webSocket;
    this._reconnectionInterval = options.reconnectionInterval;

    this._onWebSocketMessageHandler = null;
    this._onWebSocketOpenHandler    = null;
    this._onWebSocketCloseHandler   = null;
    this._onWebSocketErrorHandler   = null;

    this.run();
  }

  static get DEFAULT_WEB_SOCKET_URL() {
    const protocol = isSecureConnection ? 'wss' : 'ws';
    const host     = WatchRemotelyWatcher.DEFAULT_WEB_SOCKET_HOST;
    const port     = WatchRemotelyWatcher.DEFAULT_WEB_SOCKET_PORT;
    const path     = WatchRemotelyWatcher.DEFAULT_WEB_SOCKET_PATH.replace(/^\/+/, '');

    return `${protocol}://${host}:${port}/${path}`;
  }

  static get DEFAULT_WEB_SOCKET_HOST() {
    return 'localhost';
  }

  static get DEFAULT_WEB_SOCKET_PORT() {
    return '4020';
  }

  static get DEFAULT_WEB_SOCKET_PATH() {
    return '/';
  }

  static get DEFAULT_RECONNECTION_INTERVAL() {
    return 5000;
  }

  static _normalizeParameters(params) {
    const options = Object.create(params || {});

    if (!options.webSocket) {
      options.webSocket = WatchRemotelyWatcher.DEFAULT_WEB_SOCKET_URL;
    }
    if (typeof options.webSocket === 'string') {
      options.webSocket = new WebSocket(options.webSocket);
    }
    if (!('reconnectionInterval' in options)) {
      options.reconnectionInterval = WatchRemotelyWatcher.DEFAULT_RECONNECTION_INTERVAL;
    }

    return options;
  }

  get isRunning() {
    return !!this._onWebSocketMessageHandler;
  }

  get webSocket() {
    return this._webSocket;
  }

  run() {
    if (!this.isRunning) {
      this._webSocket.addEventListener('message', this._onWebSocketMessageHandler = this._onWebSocketMessage.bind(this));
      this._webSocket.addEventListener('open',    this._onWebSocketOpenHandler    = this._onWebSocketOpen.bind(this));
      this._webSocket.addEventListener('close',   this._onWebSocketCloseHandler   = this._onWebSocketClose.bind(this));
      this._webSocket.addEventListener('error',   this._onWebSocketErrorHandler   = this._onWebSocketError.bind(this));
    }
    return this;
  }

  stop() {
    if (this.isRunning) {
      this._webSocket.removeEventListener('message', this._onWebSocketMessageHandler);
      this._webSocket.removeEventListener('open',    this._onWebSocketOpenHandler);
      this._webSocket.removeEventListener('close',   this._onWebSocketCloseHandler);
      this._webSocket.removeEventListener('error',   this._onWebSocketErrorHandler);

      this._onWebSocketMessageHandler = null;
      this._onWebSocketOpenHandler    = null;
      this._onWebSocketCloseHandler   = null;
      this._onWebSocketErrorHandler   = null;
    }
    return this;
  }

  _reconnect() {
    const url = this._webSocket.url;

    this.stop();
    this._webSocket = new WebSocket(url);
    this.run();
  }

  _onWebSocketMessage(message) {
    const { event, path, content } = JSON.parse(message.data);
    const type = EVENT_TYPE_MAP[event];

    if (type) {
      this.notify({ type, module: path, content });
    }
  }

  _onWebSocketOpen() {
    this.log(`Start listen to file system changes on ${this._webSocket.url}`);
  }

  _onWebSocketClose() {
    if (this._webSocket.readyState === 3 && this._reconnectionInterval) {
      setTimeout(() => this._reconnect(), this._reconnectionInterval);
    }
  }

  _onWebSocketError(error) {
    this.notifyError(error);
  }
}
