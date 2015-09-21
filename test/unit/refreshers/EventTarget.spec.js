import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import dirtyChai from 'dirty-chai';
import { spy } from 'sinon';
import { jsdom } from 'jsdom';
import { eventTargetRefresher } from '../../../src/refreshers/eventTarget';

chai.use(sinonChai);
chai.use(dirtyChai);

const global = jsdom().defaultView;
const { Event, EventTarget } = global;

describe('eventTargetRefresher', () => {
  let hmr;
  let refresh;

  function createMockHmr() {
    return {
      global: {
        EventTarget,
      },
    };
  }

  beforeEach(() => {
    hmr = createMockHmr();
    refresh = eventTargetRefresher(hmr);
  });

  it('should return "refresh" function', () => {
    expect(refresh).to.be.a('function');
  });

  it('"refresh" function should remove added event listeners for current execution context module', () => {
    const eventTarget = new EventTarget();
    const eventName = 'some_event';
    const eventListener1 = spy();
    const eventListener2 = spy();

    hmr.executionContextModule = 'module1';
    eventTarget.addEventListener(eventName, eventListener1, false);

    hmr.executionContextModule = 'module2';
    eventTarget.addEventListener(eventName, eventListener2, false);

    refresh('module1');

    const event = new Event(eventName);
    eventTarget.dispatchEvent(event);

    expect(eventListener1).to.have.not.been.called();
    expect(eventListener2).to.have.been.calledWith(event);
  });

  it('"refresh" function shouldn\'t remove added event listeners if execution context module doesn\'t exists', () => {
    const eventTarget = new EventTarget();
    const eventName = 'some_event';
    const listener = spy();

    eventTarget.addEventListener(eventName, listener, false);
    refresh();

    const event = new Event(eventName);
    eventTarget.dispatchEvent(event);

    expect(listener).to.have.been.calledWith(event);
  });
});
