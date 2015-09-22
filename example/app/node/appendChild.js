export function testAppendChild(container, _child) {
  let child = _child;

  if (!child) {
    child = document.createElement('span');
    child.classList.add('node-appended-child');
    child.textContent = 'appended child';
  }

  if (typeof child === 'string') {
    child = document.createElement(child);
  }

  container.appendChild(child);

  return child;
}