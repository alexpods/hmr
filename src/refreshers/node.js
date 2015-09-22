function createAppendChildRefresher(hmr, Node) {
  const appended = {};
  const baseAppendChild = Node.prototype.appendChild;

  Node.prototype.appendChild = function appendChild(...args) {
    const moduleName = hmr.executionContextModule;

    if (!(moduleName in appended)) {
      appended[moduleName] = [];
    }
    const child = args[0];

    if (child.nodeName === 'LINK') {
      const href = child.getAttribute('href');
      const separator = href.indexOf('?') === -1 ? '?' : '&';
      child.setAttribute('href', href + separator + Date.now());
    }

    appended[moduleName].push(child);

    return baseAppendChild.apply(this, args);
  };

  return function refreshAppendChild(moduleName) {
    if (moduleName in appended) {
      appended[moduleName].forEach((childNode) => {
        const parentNode = childNode.parentNode;

        if (parentNode) {
          parentNode.removeChild(childNode);
        }
      });
      appended[moduleName] = [];
    }
  };
}


function createInsertBeforeRefresher(hmr, Node) {
  const insertedBefore = {};
  const baseInsertBefore = Node.prototype.insertBefore;

  Node.prototype.insertBefore = function insertBefore(newChild, refChild) {
    const moduleName = hmr.executionContextModule;

    if (moduleName) {
      if (!(moduleName in insertedBefore)) {
        insertedBefore[moduleName] = [];
      }

      insertedBefore[moduleName].push([newChild, newChild.parentNode]);
    }

    return baseInsertBefore.call(this, newChild, refChild);
  };

  return function refreshInsertBefore(moduleName) {
    if (moduleName in insertedBefore) {
      insertedBefore[moduleName].forEach(([newChild) => {
        if (newChild.parentNode) {
          newChild.parentNode.removeChild(newChild);
        }
      });
      delete insertedBefore[moduleName];
    }
  };
}


export function createNodeRefresher(hmr) {
  const Node = hmr.global.Node;

  const refreshers = [
    createAppendChildRefresher(hmr, Node),
    createInsertBeforeRefresher(hmr, Node),
  ];

  return function refreshNode(moduleName) {
    refreshers.forEach(refresh => refresh(moduleName));
  };
}
