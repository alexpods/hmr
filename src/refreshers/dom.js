export function domRefresher(hmr) {
  const Node = hmr.global.Node;
  const baseAppendChild = Node.prototype.appendChild;

  const appended = {};

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

  return function clearDOM(moduleName) {
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
