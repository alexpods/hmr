import { EventEmitter } from 'events';
import { spy } from 'sinon';

function MockWebSocket(url, isConnecting = true) {
  const webSocket = new EventEmitter();
  webSocket.addEventListener = spy(webSocket, 'on');
  webSocket.removeEventListener = spy(webSocket, 'removeListener');
  webSocket.postMessage = spy();
  webSocket.url = url || 'ws://localhost/path';
  webSocket.readyState = isConnecting ? 0 : 1;
  return webSocket;
}

/* eslint-disable no-new-func */
const global = (new Function('return this'))();
/* eslint-enable no-new-func */

global.WebSocket = MockWebSocket;
