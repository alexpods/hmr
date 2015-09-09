import { spy } from 'sinon';
import { forEach } from 'lodash';
import { EventEmitter } from 'events';
import { expect } from 'chai';
import { WatchRemotelyWatcher } from '../../src/Watchers/WatchRemotelyWatcher';

function createFakeWebSocket(url, isConnecting = true) {
  const webSocket = new EventEmitter();
  webSocket.addEventListener = spy(webSocket, 'on');
  webSocket.removeEventListener = spy(webSocket, 'removeListener');
  webSocket.postMessage = spy();
  webSocket.url = url || 'ws://localhost/path';
  webSocket.readyState = isConnecting ? 0 : 1;
  return webSocket;
}

function createFakeWebSocketMessage(data) {
  return { data: JSON.stringify(data) };
}

global.WebSocket = createFakeWebSocket;

describe('WatchRemotelyWatcher', () => {
  describe('initializing', () => {
    it('should be initialized with WebSocket object', () => {
      const fakeWebSocket = createFakeWebSocket();
      const watcher = new WatchRemotelyWatcher({ webSocket: fakeWebSocket });

      expect(watcher.webSocket).to.equal(fakeWebSocket);
    });

    it('should create new WebSocket base on specified url', () => {
      const url = 'ws://somehost:3434/path';
      const watcher = new WatchRemotelyWatcher({ webSocket: url });

      expect(watcher.webSocket.url).to.equal(url);
      expect(watcher.webSocket.addEventListener).to.be.a('function');
      expect(watcher.webSocket.postMessage).to.be.a('function');
    });

    it('should create new WebSocket based on default url', () => {
      const watcher = new WatchRemotelyWatcher();

      expect(watcher.webSocket.url).to.equal(WatchRemotelyWatcher.DEFAULT_WEB_SOCKET_URL);
    });

    it('should begin trying to reconnect on closing web socket connection', (done) => {
      const fakeWebSocket = createFakeWebSocket();
      const watcher = new WatchRemotelyWatcher({ webSocket: fakeWebSocket, reconnectionInterval: 1 });

      fakeWebSocket.readyState = 3;
      fakeWebSocket.emit('close');

      setTimeout(() => {
        expect(watcher.webSocket).to.not.equal(fakeWebSocket);
        expect(watcher.webSocket.readyState).to.equal(0);
        done();
      }, 2);
    });

    it('should run right after initialization', () => {
      const watcher = new WatchRemotelyWatcher();

      expect(watcher.isRunning).to.equal(true);
    });
  });

  describe('running', () => {
    let watcher;
    let observers;
    let unsubscribes;
    let fakeWebSocket;

    beforeEach(() => {
      fakeWebSocket = createFakeWebSocket();
      watcher = new WatchRemotelyWatcher({ webSocket: fakeWebSocket });

      observers    = [];
      unsubscribes = [];
      for (let i = 0; i < 3; ++i) {
        observers[i]    = { next: spy(), error: spy(), complete: spy() };
        unsubscribes[i] = watcher.subscribe(observers[i]);
      }
    });

    it('should notify observers on error in web socket', () => {
      const error = new Error('some error');

      fakeWebSocket.emit('error', error);

      forEach(observers, (observer) => {
        expect(observer.next.notCalled).to.equal(true);
        expect(observer.error.calledWith(error)).to.equal(true);
        expect(observer.complete.notCalled).to.equal(true);
      });
    });

    forEach({ 'add': 'create', 'change': 'update', 'unlink': 'remove' }, (type, event) => {
      it(`should emit "${type}" event on file system event "${event}"`, () => {
        const path    = 'some/path';
        const content = ' some very long content ';
        const message = createFakeWebSocketMessage({ event, path, content });

        fakeWebSocket.emit('message', message);

        forEach(observers, (observer) => {
          expect(observer.next.calledWithMatch({ type, module: path, content })).to.equal(true);
          expect(observer.error.notCalled).to.equal(true);
          expect(observer.complete.notCalled).to.equal(true);
        });
      });
    });

    forEach(['addDir', 'unlinkDir'], (event) => {
      it(`should not emit any event on file system event "${event}"`, () => {
        const path = 'some/path';
        const message = createFakeWebSocketMessage({ event, path });

        fakeWebSocket.emit('message', message);

        forEach(observers, (observer) => {
          expect(observer.next.notCalled).to.equal(true);
          expect(observer.error.notCalled).to.equal(true);
          expect(observer.complete.notCalled).to.equal(true);
        });
      });
    });
  });
});
