export function __hmr__() {
  clearInterval(interval);
  console.log('interval was cleared');
}


import { increment } from './increment';

var interval = setInterval(() => console.log(increment()), 1000);