import { content } from './text.js';
import { increment } from './increment.js';
import { increment2 } from './increment2.js';
import { getMessage } from './getMessage.js';
import { testAppendChild } from './node/appendChild.js';
import { testDOMTokenList } from './refreshers/DOMTokenList';
import './styles.css!css';

console.log('reload');

const target = document.querySelector('#target');
const container1 = document.querySelector('#container1');
const container2 = document.querySelector('#container2');
const element = document.querySelector('#element');

container1.innerHTML = content;


/* Timers */

//setInterval(() => console.log(increment()), 3000);
//setInterval(() => console.log(increment2()), 3000);


/* EventTarget.prototype.addEventListener */

target.addEventListener('click', () => console.log(getMessage() + 'here'), false);

/* Node.prototype.appendChild */

const span1 = testAppendChild(container2);

/* Node.prototype.insertBefore - insert node without parent */

const span2 = document.createElement('span');
span2.classList.add('node-inserted-before');
span2.textContent = 'inserted before2';
container2.insertBefore(span2, span1);

/* Node.prototype.insertBefore - insert node which already exists in document */

container2.insertBefore(element, span2);

testDOMTokenList(window.elementDOMTokenList);