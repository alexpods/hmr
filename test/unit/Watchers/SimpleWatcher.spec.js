import { expect } from 'chai';
import { spy } from 'sinon';
import { SimpleWatcher } from '../../../src/Watchers/SimpleWatcher';

Object.defineProperty(SimpleWatcher, 'DEFAULT_LOGGER',  { value: false });

describe('SimpleWatcher', () => {
  let watcher;
  let observer;

  beforeEach(() => {
    watcher = new SimpleWatcher();
    observer = { next: spy(), error: spy(), complete: spy() };
  });

  it('should subscribe/notify/unsubscribe observer', () => {
    const event = { type: 'create', module: 'some_module' };

    const unsubscribe = watcher.subscribe(observer);

    expect(observer.next.notCalled).to.equal(true);

    watcher.notify(event);
    expect(observer.next.calledOnce).to.equal(true);
    expect(observer.next.calledWith(event)).to.equal(true);
    expect(observer.error.notCalled).to.equal(true);
    expect(observer.complete.notCalled).to.equal(true);

    unsubscribe();
    watcher.notify(event);
    expect(observer.next.calledOnce).to.equal(true);
    expect(observer.error.notCalled).to.equal(true);
    expect(observer.complete.notCalled).to.equal(true);
  });

  it('should throw if event does not contain "type" field', () => {
    const event = { module: 'some_module' };

    watcher.subscribe(observer);
    expect(() => watcher.notify(event)).to.throw();
    expect(observer.next.notCalled).to.equal(true);
    expect(observer.error.notCalled).to.equal(true);
    expect(observer.complete.notCalled).to.equal(true);
  });

  it('should throw if event does not contain "module" field', () => {
    const event = { type: 'create' };

    watcher.subscribe(observer);
    expect(() => watcher.notify(event)).to.throw();
    expect(observer.next.notCalled).to.equal(true);
    expect(observer.error.notCalled).to.equal(true);
    expect(observer.complete.notCalled).to.equal(true);
  });

  it('should throw on notify with unsupported event', () => {
    const event  = { type: 'unsupportedEvent', module: 'some_module' };

    watcher.subscribe(observer);
    expect(() => watcher.notify(event)).to.throw();
    expect(observer.next.notCalled).to.equal(true);
    expect(observer.error.notCalled).to.equal(true);
    expect(observer.complete.notCalled).to.equal(true);
  });

  it('should notify observer on error', () => {
    const error = new Error('some error');

    watcher.subscribe(observer);
    watcher.notifyError(error);
    expect(observer.next.notCalled).to.equal(true);
    expect(observer.error.calledWith(error)).to.equal(true);
    expect(observer.complete.notCalled).to.equal(true);
  });
});
