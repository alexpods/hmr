function createTextContentRefresher(hmr, Node) {
  const textContents = {};
  const descriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');

  Object.defineProperty(Node.prototype, 'textContent', Object.assign({}, descriptor, {
    ['set'](textContent) {
      const node = this;
      const moduleName  = hmr.executionContextModule;

      let moduleTextContents = textContents[moduleName];

      if (!moduleTextContents) {
        moduleTextContents = textContents[moduleName] = new Map();
      }

      if (!moduleTextContents.has(node)) {
        moduleTextContents.set(node, descriptor.get.call(this));
      }

      return descriptor.set.call(node, textContent);
    },
  }));

  return function refreshTextContent(moduleName) {
    if (moduleName in textContents) {
      textContents[moduleName].forEach((previousContent, node) => {
        descriptor.set.call(node, previousContent);
      });
      delete textContents[moduleName];
    }
  };
}

function createAppendChildRefresher(hmr, Node) {
  return hmr.refresherHook(Node.prototype, 'appendChild', {
    hook(container, parent, args) {
      const child = args[0];

      if (child.nodeName === 'LINK') {
        const href = child.getAttribute('href');
        const separator = href.indexOf('?') === -1 ? '?' : '&';
        child.setAttribute('href', href + separator + Date.now());
      }

      container.push(child);
    },
    refresh(container) {
      container.forEach((childNode) => {
        const parentNode = childNode.parentNode;

        if (parentNode) {
          parentNode.removeChild(childNode);
        }
      });
    },
  });
}


function createInsertBeforeRefresher(hmr, Node) {
  const insertBefore = hmr.getUnhooked(Node.prototype, 'insertBefore');

  return hmr.refresherHook(Node.prototype, 'insertBefore', {
    hook(container, parent, args) {
      const newChild = args[0];

      container.push([parent, newChild, newChild.parentNode, newChild.nextSibling]);
    },
    refresh(container) {
      container.reverse().forEach(([parent, newChild, newChildParentNode, newChildNextSibling]) => {
        if (!newChildParentNode) {
          if (newChild.parentNode === parent) {
            parent.removeChild(newChild);
          }
        } else {
          insertBefore.call(newChildParentNode, newChild, newChildNextSibling);
        }
      });
    },
  });
}


function createReplaceChildRefresher(hmr, Node) {
  return hmr.refresherHook(Node.prototype, 'replaceChild', {
    hook() {},
    refresh() {},
  });
}


export function createNodeRefresher(hmr) {
  const Node = hmr.global.Node;

  const refreshers = [
    createAppendChildRefresher(hmr, Node),
    createInsertBeforeRefresher(hmr, Node),
    createTextContentRefresher(hmr, Node),
    createReplaceChildRefresher(hmr, Node),
  ];

  return function refreshNode(moduleName) {
    refreshers.forEach(refresh => refresh(moduleName));
  };
}
