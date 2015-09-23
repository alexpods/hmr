function record(records, moduleName, tokenList, token, operation) {
  let tokens = records.get(tokenList);

  if (!tokens) {
    tokens = {};
    records.set(tokenList, tokens);
  }

  tokens[token] = [moduleName, operation];
}

function hook(object, methodName, records) {
  const method = object[methodName];
  const hookMethod = Object.defineProperties(function hookMethod(...args) {
    record(records, moduleName, this, args[0], methodName);
    return method.apply(this, args);
  }, {
    name: { value: methodName },
    toString: { value: `function ${methodName}() { [native code] }` },
  });

  return method;
}

export function createDOMTokenListRefresher(hmr) {
  const { DOMTokenList } = hmr.global;
  const { add: baseAdd, remove: baseRemove } = DOMTokenList.prototype;
  const records = new WeakMap();

  DOMTokenList.prototype.add = function add(...args) {
    record(records, hmr.executionContextModule, this, args[0], 'add');
    return baseAdd.apply(this, args);
  };

  DOMTokenList.prototype.remove = function remove(...args) {
    record(records, hmr.executionContextModule, this, args[0], 'remove');
    return baseRemove.apply(this, args);
  };

  return (moduleName) => records.forEach((tokens, token) => {

  });
}
