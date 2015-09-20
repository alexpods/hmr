import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';
import { spy } from 'sinon';
import { SimpleWatcher } from '../../src/Watchers/SimpleWatcher';
import { ModuleReplacer } from '../../src/ModuleReplacer';
import { ModuleManager } from '../../src/ModuleManager';
import { modules } from '../modules';
import { forEach } from 'lodash';

chai.use(dirtyChai);
chai.use(sinonChai);

describe('ModuleReplacer', () => {
  let watcher;
  let loaderAdapter;
  let replacer;

  function createMockWatcher() {
    const mockWatcher = new SimpleWatcher();
    mockWatcher.subscribe = spy(mockWatcher, 'subscribe');
    return mockWatcher;
  }

  function createMockLoaderAdapter() {
    const moduleManager = new ModuleManager();

    forEach(modules, (module) => {
      moduleManager.set(module.name, module.dependencies);
    });

    return {
      getModule: spy((moduleName) => {
        return modules[moduleName].exports;
      }),
      getSynonyms: spy((moduleName) => {
        return [moduleName];
      }),
      getDependants: spy((moduleName) => {
        return moduleManager.getDependants(moduleName);
      }),
      normalize: spy((moduleName) => {
        return moduleName;
      }),
      remove: spy(),
      refresh: spy(),
      execute: spy(),
    };
  }

  beforeEach(() => {
    watcher = createMockWatcher();
    loaderAdapter = createMockLoaderAdapter();
    replacer = new ModuleReplacer({ loaderAdapter, watcher });
    replacer.replace = spy(replacer, 'replace');
  });

  describe('.isRunning', () => {
    it('should equals to `true` after replacer was runned', () => {
      expect(replacer.isRunning).to.be.false();
      replacer.run();
      expect(replacer.isRunning).to.be.true();
    });

    it('should equals to `false` after replacer was stopped', () => {
      replacer.run();
      expect(replacer.isRunning).to.be.true();
      replacer.stop();
      expect(replacer.isRunning).to.be.false();
    });
  });

  describe('.replace( moduleName )', () => {
    function expectReplace(module, refreshingModules = []) {
      const refreshingModulesNames = refreshingModules.map(refreshingModule => refreshingModule.name);

      return replacer.replace(module.name).then((replacedModulesNames) => {
        expect(loaderAdapter.remove).to.have.been.calledWith(module.name);
        expect(loaderAdapter.refresh).to.have.callCount(refreshingModules.length);
        expect(loaderAdapter.execute).to.have.been.calledWith(module.name);
        expect(replacedModulesNames.sort()).to.deep.equal([module.name].concat(refreshingModulesNames).sort());
      });
    }

    it('should replace module and all its deep dependants', () => {
      return expectReplace(modules.c, [modules.d, modules.e, modules.f, modules.g]);
    });

    it('should replace module and all its deep dependants and dependants must be refreshed only once', () => {
      return expectReplace(modules.a, [modules.b, modules.c, modules.d, modules.e, modules.f, modules.g]);
    });

    it('should replace module and handle circular dependants', () => {
      return expectReplace(modules.circular_a, [modules.circular_b, modules.circular_c]);
    });
  });

  describe('.run()', () => {
    function expectReplaceModuleOnNotification(eventType, module = modules.a) {
      replacer.run();
      expect(replacer.replace).to.have.not.been.called();
      watcher.notify({ type: eventType, module: module.name });

      expect(replacer.replace).to.have.been.calledOnce();
      expect(replacer.replace).to.have.been.calledWith(module.name);
    }

    it('should subscribe to watcher', () => {
      expect(watcher.subscribe).to.have.not.been.called();
      replacer.run();
      expect(watcher.subscribe).to.have.been.calledOnce();
      expect(watcher.subscribe.args[0][0]).to.have.property('next').and.be.a('function');
      expect(watcher.subscribe.args[0][0]).to.have.property('error').and.be.a('function');
    });

    it('should not subscribe to watcher if it\'s already running', () => {
      replacer.run();
      expect(watcher.subscribe).to.have.been.calledOnce();
      replacer.run();
      expect(watcher.subscribe).to.have.been.calledOnce();
    });

    it('should replace module on "create" notification', () => {
      return expectReplaceModuleOnNotification('create');
    });

    it('should replace module on "update" notification', () => {
      return expectReplaceModuleOnNotification('update');
    });

    it('should replace module on "remove" notification', () => {
      return expectReplaceModuleOnNotification('remove');
    });
  });

  describe('.stop()', () => {
    beforeEach(() => {
      replacer.run();
    });

    it('should unsusbscribe from watcher', () => {
      watcher.notify({ type: 'create', module: modules.a.name });
      expect(replacer.replace).to.have.been.calledOnce();
      expect(replacer.replace).to.have.been.calledWith(modules.a.name);

      replacer.stop();

      watcher.notify({ type: 'update', module: modules.b.name });
      expect(replacer.replace).to.have.been.calledOnce();
      expect(replacer.replace).to.have.not.been.calledWith(modules.b.name);
    });
  });
});
