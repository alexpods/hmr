import { content } from './text.js';
import { increment } from './increment.js';
import './styles.css!css';

console.log('reload');

document.body.innerHTML = `
  ${content}
`;