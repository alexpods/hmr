export function eventTargetRefresher(hmr) {
  const { EventTarget } = hmr.global;

  const listeners = {};
  const baseAddEventListener = EventTarget.prototype.addEventListener;

  EventTarget.prototype.addEventListener = function addEventListener(eventName, listener, useCapture) {
    const moduleName = hmr.executionContextModule;

    if (moduleName) {
      if (!(moduleName in listeners)) {
        listeners[moduleName] = [];
      }
      listeners[moduleName].push({ target: this, eventName, listener, useCapture });
    }

    return baseAddEventListener.call(this, eventName, listener, useCapture);
  };

  return function refreshEventTargets(moduleName) {
    if (moduleName && moduleName in listeners) {
      listeners[moduleName].forEach(({ target, eventName, listener, useCapture }) => {
        target.removeEventListener(eventName, listener, useCapture);
      });
      listeners[moduleName] = [];
    }
  };
}
