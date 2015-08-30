export class Replacer {

  constructor({ loader, watcher }) {
    this._loader  = loader;
    this._watcher = watcher;

    this._contents   = {};
    this._dependants = {};

    this._isHooked     = false;
    this._subscription = null;
  }

  run() {
    const loader  = this._loader;
    const watcher = this._watcher;

    if (!this._isHooked) {
      this._hook('translate', (translate, load) => {
        this._setContent(load.name, load.source);
        return translate();
      });

      this._hook('instantiate', (instantiate, load) => instantiate().then((entry) => {
        entry.deps.forEach(dep => this._addDependant(this._normalize(dep, load.name), load.name));
        return entry;
      }));

      this._isHooked = true;
    }

    this._subscription = watcher.subscribe((moduleName, content) => {
      this._setContent(moduleName, content);

      var reloadingModuleNames = [moduleName].concat(Object.keys(this._dependants[moduleName] || {}));

      return Promise.resolve()
        .then(() => {
          return Promise.all(reloadingModuleNames.map((moduleName) => {
            return this._loader.import(moduleName).then((m) => {
              if (m.__hmr__) {
                return m.__hmr__();
              }
            });
          }));
        })
        .then(() => {
          reloadingModuleNames.forEach((reloadingModuleName) => {
            console.log('Reloading module "' + reloadingModuleName + '"!');

            loader.uninstall(reloadingModuleName);

            const content = this._contents[reloadingModuleName];

            if (content) {
              loader.define(reloadingModuleName, content);
            }
          });

          reloadingModuleNames.forEach((reloadingModuleName) => {
            loader.import(reloadingModuleName);
          })
        });
    });
  }

  stop() {
    this._watcher.unsubscribe(this._subscription);
    this._subscription = null;
  }

  _setContent(moduleName, content) {
    const loader = this._loader;

    moduleName = loader.resolve(moduleName);

    this._contents[moduleName] = content;
    return this;
  }

  _normalize(name, relative) {
    return new URL(name, relative).href
  }

  _addDependant(moduleName, dependant) {
    const loader = this._loader;

    moduleName = loader.resolve(moduleName);
    dependant  = loader.resolve(dependant);

    if (!(moduleName in this._dependants)) {
      this._dependants[moduleName] = {};
    }
    this._dependants[moduleName][dependant] = true;
    return this;
  }

  _hook(method, callback) {
    const loader    = this._loader;
    const oldMethod = loader.hook(method);

    loader.hook(method, function() {
      const args = [];

      for (var i = 0; i < arguments.length; ++i) {
        args.push(arguments[i]);
      }

      return callback.apply(this, [() => oldMethod.apply(this, args)].concat(args));
    });
  }
}