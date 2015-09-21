import { content } from './text.js';
import { increment } from './increment.js';
import { increment2 } from './increment2.js';
import { getMessage } from './getMessage.js';
import './styles.css!css';

console.log('reload');

const target = document.querySelector('#target');
const container = document.querySelector('#container');

container.innerHTML = content;


/* Timers */

//setInterval(() => console.log(increment()), 3000);
//setInterval(() => console.log(increment2()), 3000);


/* Event Target */

target.addEventListener('click', () => console.log(getMessage()), false);

