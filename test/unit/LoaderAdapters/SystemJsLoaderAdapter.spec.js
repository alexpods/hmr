/* eslint-disable */

import systemjs from 'systemjs';
import { map } from 'lodash';
import { expect } from 'chai';
import { spy } from 'sinon';
import { modules } from '../../modules';
import { ModuleManager } from '../../../src/ModuleManager';
import { SystemJsLoaderAdapter } from '../../../src/LoaderAdapters/SystemJsLoaderAdapter';

function createSystem() {
  const system = new (systemjs.constructor)();
  system.transpiler = false;
  system.fetch = spy(system, 'fetch');
  return system;
}

xdescribe('SystemJsLoaderAdapter', () => {
  let System;
  let moduleManager;
  let loaderAdapter;

  function testModuleExecute({ isFetched, isExecuted }) {
    const fetchCount = System.fetch.callCount;

    global.__spy = spy();
    expect(global.__spy.notCalled).to.equal(true);

    return Promise.resolve(loaderAdapter.execute(modules.a)).then(() => {
      expect(System.fetch.callCount !== fetchCount).to.equal(isFetched);
      expect(global.__spy.called).to.equal(isExecuted);
    });
  }

  function testModuleExecutes(count, { isFetched, isExecuted }) {
    let promise = Promise.resolve();

    for (let i = 0; i < count; ++i) {
      promise = promise.then(testModuleExecute.bind(null, {
        isFetched: typeof isFetched === 'function' ? isFetched(i) : isFetched,
        isExecuted: typeof isExecuted === 'function' ? isExecuted(i) : isExecuted
      }));
    }

    return promise;
  }

  beforeEach(() => {
    System = createSystem();
    moduleManager = new ModuleManager();
    loaderAdapter = new SystemJsLoaderAdapter({ System, moduleManager });

    const normalizePromises = map(modulePaths, (path, name) => {
      return Promise.resolve(loaderAdapter.normalize(path)).then(normalizedName => moduleNames[name] = normalizedName);
    });

    return Promise.all(normalizePromises);
  });

  describe('.getModule( normalizedModuleName )', () => {
    beforeEach(() => {
      return System.import(modules.a.path);
    });

    it('should get module exports', () => {
      return loaderAdapter.normalize(modules.a.path).then((normalizedModuleName) => {
        const moduleA = loaderAdapter.getModule(normalizedModuleName);

        expect(moduleA).to.have.property('a1', 10);
        expect(moduleA).to.have.property('a2', 20);
      });
    });

    it('should return null if module wasn\'t imported yet', () => {
      return loaderAdapter.normalize(modules.b.path).then((normalizedModuleName) => {
        const moduleB = loaderAdapter.getModule(normalizedModuleName);

        expect(moduleB).to.be.null();
      });
    });

    it('should get module only by normalized module name', () => {
      const moduleA = loaderAdapter.getModule(modules.a.path);

      expect(moduleA).to.be.null();
    })
  });

  it('should execute module only first time', () => {
    return testModuleExecutes(3, { isFetched: i => !i, isExecuted: i =>  !i });
  });

  it('should fetch module on .execute() if its content does not exist in module manager', () => {
    expect(moduleManager.has(moduleNames.a)).to.equal(false);
    expect(System.fetch.notCalled).to.equal(true);

    return Promise.resolve(loaderAdapter.execute(moduleNames.a)).then(() => {
      expect(System.fetch.calledOnce).to.equal(true);
    });
  });

  it('should not fetch module on .execute() if its content already exist in module manager', () => {
    expect(moduleManager.has(moduleNames.a)).to.equal(false);
    moduleManager.set(moduleNames.a, [], { source: 'exports.some_source = "source"', metadata: {}});
    expect(moduleManager.has(moduleNames.a)).to.equal(true);

    expect(System.fetch.notCalled).to.equal(true);

    return Promise.resolve(loaderAdapter.execute(moduleNames.a)).then(() => {
      expect(System.fetch.notCalled).to.equal(true);
    });
  });

  it('should force to fetch and execute module on the next .execute() call after .remove()', () => {
    return Promise.resolve()
      .then(() => testModuleExecutes(3, { isFetched: i => !i, isExecuted: i =>  !i }))
      .then(() => loaderAdapter.remove(moduleNames.a))
      .then(() => testModuleExecutes(3, { isFetched: i => !i, isExecuted: i =>  !i }));
  });

  it('should force to execute module on the next .execute() call after .refrest()', () => {
    return Promise.resolve()
      .then(() => testModuleExecutes(3, { isFetched: i => !i, isExecuted: i =>  !i }))
      .then(() => loaderAdapter.refresh(moduleNames.a))
      .then(() => testModuleExecutes(3, { isFetched: false, isExecuted: i =>  !i }));
  });
});
