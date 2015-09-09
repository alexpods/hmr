System.register([], function (_export) {
  "use strict";

  var SimpleWatcher;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  return {
    setters: [],
    execute: function () {
      SimpleWatcher = (function () {
        function SimpleWatcher() {
          _classCallCheck(this, SimpleWatcher);

          this._subscribers = {};
          this._lastSubscriptionId = 0;
        }

        _createClass(SimpleWatcher, [{
          key: "subscribe",
          value: function subscribe(callback) {
            var subscriptionId = ++this._lastSubscriptionId;
            this._subscribers[subscriptionId] = callback;
            return subscriptionId;
          }
        }, {
          key: "unsubscribe",
          value: function unsubscribe() {
            delete this._subscribers[Id];
          }
        }, {
          key: "notify",
          value: function notify(type, module, content) {
            for (var subscriptionId in this._subscribers) {
              if (this._subscribers.hasOwnProperty(subscriptionId)) {
                this._subscribers[subscriptionId](type, module, content);
              }
            }
          }
        }]);

        return SimpleWatcher;
      })();

      _export("SimpleWatcher", SimpleWatcher);
    }
  };
});