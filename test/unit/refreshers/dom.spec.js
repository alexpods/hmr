import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import dirtyChai from 'dirty-chai';
import { spy } from 'sinon';
import { domRefresher } from '../../../src/refreshers/dom';

chai.use(sinonChai);
chai.use(dirtyChai);

describe('domRefresher', () => {
  let clear;
  let mockHmr;
  let MockNode;

  function createMockNode() {
    function Node() {
      this.removeChild = spy(this.removeChild);
      this.appendChild = spy(this.appendChild);
    }
    Node.prototype.appendChild = function appendChild(child) {
      child.parentNode = this;
    };
    Node.prototype.removeChild = () => {};
    return Node;
  }

  function createMockHmr(Node) {
    return {
      global: { Node },
    };
  }

  beforeEach(() => {
    MockNode = createMockNode();
    mockHmr = createMockHmr(MockNode);
    clear = domRefresher(mockHmr);
  });

  it('should return "clear" function', () => {
    expect(clear).to.be.a('function');
  });

  it('"clear" function should remove appended nodes', () => {
    mockHmr.executionContextModule = 'module';
    const parent = new MockNode();
    const child = new MockNode();

    parent.appendChild(child);
    clear('module');

    expect(parent.removeChild).to.have.been.calledWith(child);
  });

  it('"clear" function should remove appended nodes only for current execution context module', () => {
    mockHmr.executionContextModule = 'module1';
    const parent1 = new MockNode();
    const child1 = new MockNode();
    parent1.appendChild(child1);

    mockHmr.executionContextModule = 'module2';
    const parent2 = new MockNode();
    const child2 = new MockNode();
    parent2.appendChild(child2);

    clear('module1');

    expect(parent1.removeChild).to.have.been.calledOn(parent1).and.calledWith(child1);
    expect(parent2.removeChild).to.have.not.been.called();
  });

  it('"clear" function shouldn\'t remove appended nodes if the parent node does not contain the child node', () => {
    mockHmr.executionContextModule = 'module';
    const parent = new MockNode();
    const child = new MockNode();

    parent.appendChild(child);
    child.parentNode = null;

    clear('module');

    expect(parent.removeChild).to.have.not.been.called();
  });
});
