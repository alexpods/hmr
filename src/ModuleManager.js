export class ModuleManager {

  constructor() {
    this._data = {};
    this._dependants = {};
    this._dependencies = {};
  }

  set(name, dependencies, data) {
    this._data[name] = data;
    this._dependencies[name] = dependencies;

    dependencies.forEach((dependency) => {
      if (!(dependency in this._dependants)) {
        this._dependants[dependency] = {};
      }
      this._dependants[dependency][name] = true;
    });
  }

  get(name) {
    return this._data[name];
  }

  has(name) {
    return name in this._data;
  }

  ['delete'](name) {
    this._dependencies[name].forEach((dependency) => {
      delete this._dependants[dependency][name]
    });
    delete this._dependants[name];
    delete this._dependencies[name];
    delete this._data[name];
  }

  getDependants(name) {
    const result = [this._dependants[name]];

    Object.keys(this._dependants[name]).forEach(function getDependantsRecursively(dependant) => {
      const dependants = this._dependants[dependant];

      if (result.indexOf(dependants) === 0) {
        result.push(dependants);
        Object.keys(dependants).forEach(getDependantsRecursively);
      }
    });

    return Object.keys(result.reduce((hash, dependants) => Object.assign(hash, dependants), {}));
  }
}