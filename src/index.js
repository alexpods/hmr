import { ModuleReplacer } from './ModuleReplacer.js';
import { WatchRemotelyWatcher } from './Watchers/WatchRemotelyWatcher.js';
import { SystemJsLoaderAdapter } from './LoaderAdapters/SystemJsLoaderAdapter.js';
import { timersRefresher } from './refreshers/timers.js';
import { createNodeRefresher } from './refreshers/node.js';
import { eventTargetRefresher } from './refreshers/eventTarget.js';

export function boot() {
  const watcher = new WatchRemotelyWatcher();
  const global = window;
  const System = global.System;
  const refreshers = [
    timersRefresher,
    createNodeRefresher,
    eventTargetRefresher,
  ];
  const loaderAdapter = new SystemJsLoaderAdapter({ System, global });
  const replacer = new ModuleReplacer({ loaderAdapter, watcher, global, refreshers });

  replacer.run();

  window.hmr = replacer;
}
