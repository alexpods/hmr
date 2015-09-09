System.register([], function (_export) {
  "use strict";

  var SystemJSLoaderAdapter;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  return {
    setters: [],
    execute: function () {
      SystemJSLoaderAdapter = (function () {
        function SystemJSLoaderAdapter(System) {
          _classCallCheck(this, SystemJSLoaderAdapter);

          this._System = System;
        }

        _createClass(SystemJSLoaderAdapter, [{
          key: "hook",
          value: function hook(name, _hook) {
            var System = this._System;

            if (!_hook) {
              return System[name];
            }

            System[name] = _hook;
          }
        }, {
          key: "resolve",
          value: function resolve(name) {
            return this._System.normalizeSync(name);
          }
        }, {
          key: "uninstall",
          value: function uninstall(name) {
            this._System["delete"](name);
          }
        }, {
          key: "import",
          value: function _import(name) {
            return this._System["import"](name);
          }
        }, {
          key: "define",
          value: function define(name, source) {
            this._System.define(name, source);
          }
        }]);

        return SystemJSLoaderAdapter;
      })();

      _export("SystemJSLoaderAdapter", SystemJSLoaderAdapter);
    }
  };
});