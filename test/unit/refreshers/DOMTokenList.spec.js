import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import { createDOMTokenListRefresher } from '../../../src/refreshers/DOMTokenList';
import { jsdom } from 'jsdom';

chai.use(dirtyChai);

const global = jsdom().defaultView;
const { DOMTokenList, document } = global;

describe('createDOMTokenListRefresher', () => {
  let hmr;
  let refresh;

  function createTokenList() {
    return document.createElement('div').classList;
  }

  beforeEach(() => {
    hmr = { global: { DOMTokenList }};
    refresh = createDOMTokenListRefresher(hmr);
  });

  it('should create "refresh" function', () => {
    expect(refresh).to.be.a('function');
  });

  it('should remove added token', () => {
    const tokenList = createTokenList();
    const token = 'some-token';

    hmr.executionContextModule = 'module';
    tokenList.add(token);

    expect(tokenList.contains(token)).to.be.true();
    refresh('module');
    expect(tokenList.contains(token)).to.be.false();
  });

  it('should\'t remove token if it was readded by another module', () => {
    const tokenList = createTokenList();
    const token = 'some-token';

    hmr.executionContextModule = 'module1';
    tokenList.add(token);

    hmr.executionContextModule = 'module2';
    tokenList.add(token);

    expect(tokenList.contains(token)).to.be.true();
    refresh('module1');
    expect(tokenList.contains(token)).to.be.true();
  });

  it('should add removed token', () => {
    const tokenList = createTokenList();
    const token = 'some-token';
    tokenList.add(token);

    hmr.executionContextModule = 'module';
    tokenList.remove(token);

    expect(tokenList.contains(token)).to.be.false();
    refresh('module');
    expect(tokenList.contains(token)).to.be.true();
  });
});
