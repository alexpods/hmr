System.register(['./Replacer', './SimpleWatcher', './HmrServerWatcher', './SystemJSLoaderAdapter'], function (_export) {
  'use strict';

  var Replacer, SimpleWatcher, HmrServerWatcher, SystemJSLoaderAdapter;

  _export('boot', boot);

  function boot() {
    var loader = new SystemJSLoaderAdapter(window.System);
    var watcher = new HmrServerWatcher('ws://localhost:4020/hmr', '/scripts');
    var replacer = new Replacer({ loader: loader, watcher: watcher });

    replacer.run();

    return replacer;
  }

  return {
    setters: [function (_Replacer) {
      Replacer = _Replacer.Replacer;
    }, function (_SimpleWatcher) {
      SimpleWatcher = _SimpleWatcher.SimpleWatcher;
    }, function (_HmrServerWatcher) {
      HmrServerWatcher = _HmrServerWatcher.HmrServerWatcher;
    }, function (_SystemJSLoaderAdapter) {
      SystemJSLoaderAdapter = _SystemJSLoaderAdapter.SystemJSLoaderAdapter;
    }],
    execute: function () {}
  };
});