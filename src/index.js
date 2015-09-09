import { Replacer } from './Replacer';
import { SimpleWatcher } from './SimpleWatcher';
import { HmrServerWatcher } from './HmrServerWatcher';
import { SystemJSLoaderAdapter } from './SystemJSLoaderAdapter';


export function boot() {
  const loader    = new SystemJSLoaderAdapter(window.System);
  const watcher   = new HmrServerWatcher('ws://localhost:4020/hmr', '/scripts');
  const replacer  = new Replacer({ loader, watcher });

  replacer.run();

  return replacer;
}