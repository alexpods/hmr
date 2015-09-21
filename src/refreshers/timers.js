const timerFunctions = {
  setTimeout: 'clearTimeout',
  setInterval: 'clearInterval',
  setImmediate: 'clearImmediate',
};

export function timersRefresher(hmr) {
  const global = hmr.global;
  const timers = {};

  Object.keys(timerFunctions).forEach((timerFunctionName) => {
    const baseFunction = global[timerFunctionName];
    const timersContainer = timers[timerFunctionName] = {};

    if (baseFunction) {
      const timerFunction = function timerFunction(...args) {
        const timer = baseFunction.apply(this, args);
        const moduleName = hmr.executionContextModule;

        if (!(moduleName in timersContainer)) {
          timersContainer[moduleName] = [];
        }

        timersContainer[moduleName].push(timer);

        return timer;
      };
      Object.defineProperty(timerFunction, 'name', { value: timerFunctionName });

      global[timerFunctionName] = timerFunction;
    }
  });

  return function clearTimers(moduleName) {
    Object.keys(timers).forEach((timerFunctionName) => {
      const clearFunction = timerFunctions[timerFunctionName];
      const timersContainer = timers[timerFunctionName];

      if (moduleName in timersContainer) {
        timersContainer[moduleName].forEach(timer => global[clearFunction](timer));
        timersContainer[moduleName] = [];
      }
    });
  };
}
