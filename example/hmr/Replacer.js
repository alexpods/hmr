System.register([], function (_export) {
  'use strict';

  var Replacer;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  return {
    setters: [],
    execute: function () {
      Replacer = (function () {
        function Replacer(_ref) {
          var loader = _ref.loader;
          var watcher = _ref.watcher;

          _classCallCheck(this, Replacer);

          this._loader = loader;
          this._watcher = watcher;

          this._contents = {};
          this._dependants = {};

          this._isHooked = false;
          this._subscription = null;
        }

        _createClass(Replacer, [{
          key: 'run',
          value: function run() {
            var _this = this;

            var loader = this._loader;
            var watcher = this._watcher;

            if (!this._isHooked) {
              this._hook('translate', function (translate, load) {
                _this._setContent(load.name, load.source);
                return translate();
              });

              this._hook('instantiate', function (instantiate, load) {
                return instantiate().then(function (entry) {
                  entry.deps.forEach(function (dep) {
                    return _this._addDependant(_this._normalize(dep, load.name), load.name);
                  });
                  return entry;
                });
              });

              this._isHooked = true;
            }

            this._subscription = watcher.subscribe(function (type, moduleName, content) {
              _this._setContent(moduleName, content);

              var reloadingModuleNames = [moduleName].concat(Object.keys(_this._dependants[moduleName] || {}));

              return Promise.resolve().then(function () {
                return Promise.all(reloadingModuleNames.map(function (moduleName) {
                  return _this._loader['import'](moduleName).then(function (m) {
                    if (m.__hmr__) {
                      return m.__hmr__();
                    }
                  });
                }));
              }).then(function () {
                reloadingModuleNames.forEach(function (reloadingModuleName) {
                  console.log('Reloading module "' + reloadingModuleName + '"!');

                  loader.uninstall(reloadingModuleName);

                  var content = _this._contents[reloadingModuleName];

                  if (content) {
                    loader.define(reloadingModuleName, content);
                  }
                });

                reloadingModuleNames.forEach(function (reloadingModuleName) {
                  loader['import'](reloadingModuleName);
                });
              });
            });
          }
        }, {
          key: 'stop',
          value: function stop() {
            this._watcher.unsubscribe(this._subscription);
            this._subscription = null;
          }
        }, {
          key: '_setContent',
          value: function _setContent(moduleName, content) {
            var loader = this._loader;

            moduleName = loader.resolve(moduleName);

            this._contents[moduleName] = content;
            return this;
          }
        }, {
          key: '_normalize',
          value: function _normalize(name, relative) {
            return new URL(name, relative).href;
          }
        }, {
          key: '_addDependant',
          value: function _addDependant(moduleName, dependant) {
            var loader = this._loader;

            moduleName = loader.resolve(moduleName);
            dependant = loader.resolve(dependant);

            if (!(moduleName in this._dependants)) {
              this._dependants[moduleName] = {};
            }
            this._dependants[moduleName][dependant] = true;
            return this;
          }
        }, {
          key: '_hook',
          value: function _hook(method, callback) {
            var loader = this._loader;
            var oldMethod = loader.hook(method);

            loader.hook(method, function () {
              var _this2 = this;

              var args = [];

              for (var i = 0; i < arguments.length; ++i) {
                args.push(arguments[i]);
              }

              return callback.apply(this, [function () {
                return oldMethod.apply(_this2, args);
              }].concat(args));
            });
          }
        }]);

        return Replacer;
      })();

      _export('Replacer', Replacer);
    }
  };
});