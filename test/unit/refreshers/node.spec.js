import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import { jsdom } from 'jsdom';
import { createNodeRefresher } from '../../../src/refreshers/node';

chai.use(dirtyChai);

const global = jsdom().defaultView;
const { document, Node } = global;

xdescribe('createNodeRefresher', () => {
  let refresh;
  let hmr;

  function createNode() {
    return document.createElement('div');
  }

  function createMockHmr() {
    return {
      global: { Node },
    };
  }

  beforeEach(() => {
    hmr = createMockHmr();
    refresh = createNodeRefresher(hmr);
  });

  it('should create "refresh" function', () => {
    expect(refresh).to.be.a('function');
  });

  describe('.appendChild() refresh', () => {
    it('should remove appended nodes', () => {
      hmr.executionContextModule = 'module';
      const parent = createNode();
      const child = createNode();

      parent.appendChild(child);
      refresh('module');

      expect(child.parent).to.be.empty();
    });

    it('should remove appended nodes only for current execution context module', () => {
      hmr.executionContextModule = 'module1';
      const parent1 = createNode();
      const child1 = createNode();
      parent1.appendChild(child1);

      hmr.executionContextModule = 'module2';
      const parent2 = createNode();
      const child2 = createNode();
      parent2.appendChild(child2);

      refresh('module1');

      expect(child1.parentNode).to.be.empty();
      expect(child2.parentNode).to.be.equal(parent2);
    });
  });

  describe('.insertBefore() refresh', () => {
    it('should remove inserted node if it wasn\'t in document before', () => {
      const parent = createNode();
      const child1 = createNode();
      const child2  = createNode();

      parent.appendChild(child1);

      hmr.executionContextModule = 'module';
      parent.insertBefore(child2, child1);

      refresh('module');

      expect(child1.parentNode).to.equal(parent);
      expect(child2.parentNode).to.be.empty();
    });

    it('should return inserted not into its previous position', () => {
      const parent1 = createNode();
      const child1 = createNode();
      parent1.appendChild(child1);

      const parent2 = createNode();
      const child2 = createNode();
      parent2.appendChild(child2);

      hmr.executionContextModule = 'module';
      parent1.insertBefore(child2, child1);

      refresh('module');

      expect(child1.parentNode).to.equal(parent1);
      expect(child2.parentNode).to.equal(parent2);
    });
  });
});
