export class ModuleReplacer {

  constructor({ loaderAdapter, watcher, global: _global, refreshers = [] }) {
    this._loaderAdapter = loaderAdapter;
    this._watcher = watcher;
    this._unsubscribeWatcher = null;
    /* eslint-disable no-new-func */
    this._global = _global
      || (typeof global !== 'undefined') && global
      || (typeof self !== 'undefined') && self
      || (typeof window !== 'undefined') && window
      || (new Function('return this'))();

    /* eslint-enable no-new-func */
    this._refreshers = refreshers.map(refresher => refresher(this));
  }

  get global() {
    return this._global;
  }

  get isRunning() {
    return !!this._unsubscribeWatcher;
  }

  get executionContextModule() {
    return this._loaderAdapter.getExecutionContextModule();
  }

  replace(moduleName) {
    return Promise.resolve(this._loaderAdapter.normalize(moduleName)).then((normalizedModuleName) => {
      const hmrModules = this._getHmrModules(normalizedModuleName);

      return Promise.resolve()
        .then(() => this._refreshModules(hmrModules))
        .then(() => this._executeModules(hmrModules))
        .then(() => hmrModules);
    });
  }

  run() {
    if (!this.isRunning) {
      this._unsubscribeWatcher = this._watcher.subscribe({
        next: (event) => {
          return this.replace(event.module);
        },
        error: (event) => {
          /* eslint-disable no-console */
          console.log(JSON.stringify(event));
          /* eslint-enable no-console */
        },
      });
    }
  }

  stop() {
    if (this.isRunning) {
      this._unsubscribeWatcher();
      this._unsubscribeWatcher = null;
    }
  }

  _getHmrModules(normalizedModuleName, event) {
    const hmrModulesHash = {};
    const hmrModules = [];

    this._getHmrModulesRecursively(normalizedModuleName, event, hmrModulesHash);

    for (const moduleName in hmrModulesHash) {
      if (hmrModulesHash[moduleName]) {
        hmrModules.push(moduleName);
      }
    }

    return hmrModules;
  }

  _getHmrModulesRecursively(normalizedModuleName, event, hmrModulesAccomulator) {
    const synonyms = this._loaderAdapter.getSynonyms(normalizedModuleName);

    synonyms.forEach((synonymModuleName) => {
      hmrModulesAccomulator[synonymModuleName] = true;

      const dependants = this._loaderAdapter.getDependants(synonymModuleName);

      dependants.forEach((dependantModuleName) => {
        if (!(dependantModuleName in hmrModulesAccomulator)) {
          this._getHmrModulesRecursively(dependantModuleName, event, hmrModulesAccomulator);
        }
      });
    });
  }

  _refreshModules(normalizedModulesNames) {
    const promises = [];
    const loaderAdapter = this._loaderAdapter;
    const refreshers = this._refreshers;

    function refreshModule(methodName) {
      return (moduleName) => {
        promises.push(loaderAdapter[methodName](moduleName));
        refreshers.forEach(refresh => promises.push(refresh(moduleName)));
      };
    }

    if (normalizedModulesNames[0]) {
      this._loaderAdapter.getSynonyms(normalizedModulesNames[0]).forEach(refreshModule('remove'));
    }

    for (let i = 1; i < normalizedModulesNames.length; ++i) {
      this._loaderAdapter.getSynonyms(normalizedModulesNames[i]).forEach(refreshModule('refresh'));
    }

    return Promise.all(promises);
  }

  _executeModules(normalizedModulesNames) {
    return Promise.all(normalizedModulesNames.map((normalizedModuleName) => {
      return this._loaderAdapter.execute(normalizedModuleName);
    }));
  }
}
