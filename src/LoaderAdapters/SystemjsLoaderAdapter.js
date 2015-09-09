export class SystemJsLoaderAdapter {

  constructor(System, moduleManager) {
    this._System = System;
    this._moduleManager = moduleManager;

    this._patch();
  }

  remove(module) {
    this._moduleManager.remove(module);
    this._System.delete(module);
  }

  refresh(module) {
    this._System.delete(module);
  }

  execute(module) {
    return this._System.import(module);
  }

  provide(module, content) {
    this._System.define(module, content);
  }

  getDependants(module) {
    return this._moduleManager.getDependants(module);
  }

  _patch() {
    const that = this;
    const System = this._System;
    const { translate: baseTranslate, instantiate: baseInstantiate } = System;

    System.translate = function translate(load) {
      const { name } = load;

      if (that._moduleManager.has(name)) {
        return that._moduleManager.get(name).source;
      }

      return baseTranslate.call(this, load);
    };

    System.instantiate = function instantiate(load) {
      const { name, address, source } = load;

      if (that._moduleManager.has(name)) {
        return that._moduleManager.get(name).instantiateResult;
      }

      return Promise.resolve(baseInstantiate.call(this, load)).then((instantiateResult) => {
        return Promise.all(result.deps.map(dep => System.normalize(dep, name, address))).then((normalizedDeps) => {
          that._moduleManager.set(name, normalizedDeps, { instantiateResult, source });

          return instantiateResult;
        });
      });
    }
  }
}