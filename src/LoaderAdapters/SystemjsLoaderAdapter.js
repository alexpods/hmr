import { ModuleManager } from '../ModuleManager.js';

const ZONE_EXECUTION_CONTEXT_FILED = 'hmrExectionContextModule.js';

export class SystemJsLoaderAdapter {

  constructor({ System, moduleManager, global }) {
    this._System = System;
    this._moduleManager = moduleManager || new ModuleManager();
    this._global = global;

    this._patch();
  }

  getExecutionContextModule() {
    return this._global.zone[ZONE_EXECUTION_CONTEXT_FILED];
  }

  getSynonyms(moduleName) {
    return this._moduleManager.getSynonyms(moduleName);
  }

  getModule(moduleName) {
    const moduleData = this._System._loader.modules[moduleName];
    return moduleData ? moduleData.module : null;
  }

  getDependants(moduleName) {
    return this._moduleManager.getDependants(moduleName);
  }

  normalize(moduleName) {
    /* eslint-disable no-param-reassign */
    if (moduleName[0] !== '/' && moduleName.indexOf('http://') !== 0) {
      moduleName = '/' + moduleName;
    }
    /* eslint-enable no-param-reassign */

    return this._System.normalize(moduleName).then((normalizedModuleName) => {
      return normalizedModuleName.replace(/\.js\.js$/, '.js').replace(/\.css\.js$/, '.css');
    });
  }

  remove(moduleName) {
    this._moduleManager.delete(moduleName);
    this._System.delete(moduleName);
  }

  refresh(moduleName) {
    this._System.delete(moduleName);
  }

  execute(moduleName) {
    const moduleManager = this._moduleManager;
    const System = this._System;

    if (moduleManager.has(moduleName)) {
      const moduleData = moduleManager.get(moduleName);

      System.define(moduleName, moduleData.source, {
        metadata: moduleData.metadata,
        address: moduleData.address,
      });
    }

    return System.import(moduleName);
  }

  _patch() {
    const that = this;
    const System = this._System;
    const global = this._global;

    const baseLoad = System.load;
    const baseFetch = System.fetch;
    const baseTranslate = System.translate;
    const baseInstantiate = System.instantiate;
    const baseImport = System.import;

    function runInZone(moduleName, callback) {
      return Promise.resolve(that.normalize(moduleName).then((normalizedModuleName) => {
        return global.zone
          .fork({
            [ZONE_EXECUTION_CONTEXT_FILED]: normalizedModuleName,
          })
          .run(() => {
            return callback();
          });
      }));
    }

    System.load = function systemLoad(...args) {
      return runInZone(args[0], () => baseLoad.apply(this, args));
    };

    System.fetch = function systemFetch(...args) {
      return runInZone(args[0].name, () => baseFetch.apply(this, args));
    };

    System.import = function systemImport(...args) {
      return runInZone(args[0], () => baseImport.apply(this, args));
    };

    System.translate = function systemTranslate(load) {
      return that._moduleManager.has(load.name) ? load.source : Promise.resolve(baseTranslate.call(this, load));
    };

    System.instantiate = function systemInstantiate(load) {
      const { name, address, source, metadata } = load;

      return Promise.resolve(baseInstantiate.call(this, load)).then((result) => {
        return Promise.all(result.deps.map(dep => System.normalize(dep, name, address))).then((normalizedDeps) => {
          const nameParts = name.split('!');

          that._moduleManager.set(name, normalizedDeps, { source, metadata });

          if (nameParts.length > 1) {
            that._moduleManager.addSynonyms(that.pluginFirst ? nameParts[1] : nameParts[0], name);
          }

          if ('execute' in result) {
            const baseExecute = result.execute;
            result.execute = function execute(...args) {
              return global.zone
                .fork({
                  [ZONE_EXECUTION_CONTEXT_FILED]: name,
                })
                .run(() => {
                  return baseExecute.apply(result, args);
                });
            };
          }
          return result;
        });
      });
    };
  }
}
