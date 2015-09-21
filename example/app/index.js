import { content } from './text.js';
import { increment } from './increment.js';
import { increment2 } from './increment2.js';
import './styles.css!css';

console.log('reload');

const target = document.querySelector('#target');
const container = document.querySelector('#container');

container.innerHTML = content;


/* Event Target */

target.addEventListener('click', () => console.log('Hello, 15!!!'), false);
