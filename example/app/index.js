import { content } from './text.js';
import { increment } from './increment.js';
import { increment2 } from './increment2.js';
import { getMessage } from './getMessage.js';
import { testAppendChild } from './node/appendChild.js';
import './styles.css!css';

console.log('reload');

const target = document.querySelector('#target');
const container1 = document.querySelector('#container1');
const container2 = document.querySelector('#container2');
const container3 = document.querySelector('#container3');
const element = document.querySelector('#element');
element.textContent = 'Must be refreshed224ssssddss4!';

container1.innerHTML = content;


/* Timers */

//setInterval(() => console.log(increment()), 3000);
//setInterval(() => console.log(increment2()), 3000);


/* EventTarget.prototype.addEventListener */

//target.addEventListener('click', () => console.log(getMessage() + 'here'), false);

//target.addEventListener('click', () => {
//  const span = testAppendChild(container2);
//  span.innerHTML += '<b>there</b>';
//});

///* Node.textContent */
//
target.addEventListener('click', () => {
  element.textContent = 'Must be refreshed224ss4!';
});
//
///* Node.prototype.appendChild() */
//
//const span1 = testAppendChild(container2);
//
///* Node.prototype.insertBefore() - insert node without parent */
//
//const span2 = document.createElement('span');
//span2.classList.add('node-inserted-before');
//span2.textContent = 'inserted before2ssss';
//container2.insertBefore(span2, span1);
//
///* Node.prototype.insertBefore() - insert node which already exists in document */
//
//container2.insertBefore(element, span2);
//
///* Node.prototype.replaceChild() */

target.addEventListener('click', () => {
  const span = testAppendChild(container3);
  span.textContent = 'replacingChildsssdds4';
  container3.replaceChild(element, span);
});
