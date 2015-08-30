import { Replacer } from './Replacer';
import { SimpleWatcher } from './SimpleWatcher';
import { SystemJSLoaderAdapter } from './SystemJSLoaderAdapter';

export function boot() {
  const loader    = new SystemJSLoaderAdapter(window.System);
  const watcher   = new SimpleWatcher();
  const replacer  = new Replacer({ loader, watcher });

  replacer.run();

  return replacer;
}