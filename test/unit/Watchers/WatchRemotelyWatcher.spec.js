import { spy } from 'sinon';
import { forEach } from 'lodash';
import { expect } from 'chai';
import { WatchRemotelyWatcher } from '../../../src/Watchers/WatchRemotelyWatcher';

function createMockWebSocketMessage(data) {
  return { data: JSON.stringify(data) };
}

describe('WatchRemotelyWatcher', () => {
  describe('initializing', () => {
    it('should be initialized with WebSocket object', () => {
      const mockWebSocket = new global.WebSocket();
      const watcher = new WatchRemotelyWatcher({ webSocket: mockWebSocket });

      expect(watcher.webSocket).to.equal(mockWebSocket);
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
      const mockWebSocket = new global.WebSocket();
      const watcher = new WatchRemotelyWatcher({ webSocket: mockWebSocket, reconnectionInterval: 1 });

      mockWebSocket.readyState = 3;
      mockWebSocket.emit('close');

      setTimeout(() => {
        expect(watcher.webSocket).to.not.equal(mockWebSocket);
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
    let mockWebSocket;

    beforeEach(() => {
      mockWebSocket = new global.WebSocket();
      watcher = new WatchRemotelyWatcher({ webSocket: mockWebSocket });

      observers    = [];
      unsubscribes = [];
      for (let i = 0; i < 3; ++i) {
        observers[i]    = { next: spy(), error: spy(), complete: spy() };
        unsubscribes[i] = watcher.subscribe(observers[i]);
      }
    });

    it('should notify observers on error in web socket', () => {
      const error = new Error('some error');

      mockWebSocket.emit('error', error);

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
        const message = createMockWebSocketMessage({ event, path, content });

        mockWebSocket.emit('message', message);

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
        const message = createMockWebSocketMessage({ event, path });

        mockWebSocket.emit('message', message);

        forEach(observers, (observer) => {
          expect(observer.next.notCalled).to.equal(true);
          expect(observer.error.notCalled).to.equal(true);
          expect(observer.complete.notCalled).to.equal(true);
        });
      });
    });
  });
});
