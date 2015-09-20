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

    timers[timerFunctionName] = {};

    if (baseFunction) {
      const timerFunction = function timerFunction(...args) {
        const timer = baseFunction.apply(this, args);
        const moduleName = hmr.executionContextModule;

        if (!(moduleName in timers)) {
          timers[timerFunctionName][moduleName] = [];
        }

        timers[timerFunctionName][moduleName].push(timer);

        return timer;
      };
      Object.defineProperty(timerFunction, 'name', { value: timerFunctionName });

      global[timerFunctionName] = timerFunction;
    }
  });

  return function clearTimers(moduleName) {
    Object.keys(timers).forEach((timerFunctionName) => {
      const clearFunction = timerFunctions[timerFunctionName];

      if (moduleName in timers[timerFunctionName]) {
        timers[timerFunctionName][moduleName].forEach(timer => global[clearFunction](timer));
        timers[timerFunctionName][moduleName] = [];
      }
    });
  };
}
