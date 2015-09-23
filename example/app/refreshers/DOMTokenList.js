const CLASSES = ['red', 'green', 'blue']

/**
 * DOMTokenList
 *
 * .add()
 * Remove added token if it exists
 *
 * .toggle()
 * Add token if it was removed
 *
 */
export function testDOMTokenList(element) {
  testDOMTokenListAdd(element);
}

/**
 * DOMTokenList.prototype.add()
 *
 * Remove added token if it exists.
 * Changing class name in the function declaration previous class name must be removed.
 */
function testDOMTokenListAdd(element, addingClassName = 'red') {
  element.classList.add(addingClassName);

  CLASSES.forEach((className) => {
    console.assert(
      addingClassName === className || !element.classList.contains(className),
      `Class name "${className}" must be removed from element.classList!`
    );
  });
}