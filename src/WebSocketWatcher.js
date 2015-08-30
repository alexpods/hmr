import { SimpleWatcher } from './Simple.js';

export class WebSocketWatcher extends SimpleWatcher {

  constructor(url) {
    super();

    this._webSocket = new window.WebSocket(url);
    this._webSocket.onmessage = this._onMessage.bind(this);
  }

  _onMessage(message) {
    const payload = JSON.parse(message);

    if (!('module' in payload) || !('content' in payload)) {
      throw new Error(`Incorrect message: ${message}!`);
    }


    this.notify(payload.module, payload.content);
  }
}