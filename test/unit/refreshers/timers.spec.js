import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import dirtyChai from 'dirty-chai';
import { spy } from 'sinon';
import { timersRefresher} from '../../../src/refreshers/timers';

chai.use(sinonChai);
chai.use(dirtyChai);

/* eslint-disable no-new-func */
const global = (new Function('return this'))();
/* eslint-enable no-new-func */

const baseSetTimeout = global.setTimeout;
const baseSetInterval = global.setInterval;
const baseSetImmediate = global.setImmediate;

describe('timersRefresher', () => {
  const timerFunctions = ['setTimeout', 'setInterval', 'setImmediate'];

  let clear;
  let hmr;

  function createMockHmr() {
    return { global };
  }

  beforeEach(() => {
    hmr = createMockHmr();
    clear = timersRefresher(hmr);
  });

  afterEach(() => {
    global.setTimeout = baseSetTimeout;
    global.setInterval = baseSetInterval;
    global.setImmediate = baseSetImmediate;
  });

  it(`should return "clear" function`, () => {
    expect(clear).to.be.a('function');
  });

  timerFunctions.forEach((timerFunction) => {
    it(`"clear" function should clear results of "${timerFunction}" functions`, (done) => {
      const timeoutCallback = spy();

      hmr.executionContextModule = 'module';
      global[timerFunction](timeoutCallback, 0);
      clear('module');

      setTimeout(() => {
        expect(timeoutCallback).to.have.not.been.called();
        done();
      }, 1);
    });
  });

  it('"clear" function should clear timeouts only for current execution context module', (done) => {
    const timeoutModule1 = spy();
    const timeoutModule2 = spy();

    hmr.executionContextModule = 'module1';
    setTimeout(timeoutModule1, 0);

    hmr.executionContextModule = 'module2';
    setTimeout(timeoutModule2, 0);

    clear('module1');

    setTimeout(() => {
      expect(timeoutModule1).to.have.not.been.called();
      expect(timeoutModule2).to.have.been.called();
      done();
    }, 1);
  });
});
