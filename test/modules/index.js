import madge from 'madge';
import path from 'path';
import { readdirSync } from 'fs';
import { forEach } from 'lodash';

function createModule({ name, dependencies, file }) {
  const modulePath = path.resolve(__dirname + '/' + file);
  const exports = require(modulePath);

  return {
    name,
    path: modulePath,
    dependencies,
    exports,
    toString: () => name,
  };
}

const modules = {};
const files   = readdirSync(__dirname);

forEach(files, (file) => {
  if (file === 'index.js') {
    return;
  }

  const name = file.replace(/\.js$/, '');
  const dependencies = madge(__dirname + '/' + file).tree[name];

  modules[name] = createModule({ name, file, dependencies });
});

export { modules };
