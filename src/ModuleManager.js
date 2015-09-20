export class ModuleManager {

  constructor() {
    this._modules = {};

    this._data = {};
    this._dependants = {};
    this._dependencies = {};
    this._synonyms = {};
  }

  set(moduleName, dependencies, data) {
    this._data[moduleName] = data;
    this._dependencies[moduleName] = dependencies;

    dependencies.forEach((dependency) => {
      if (!(dependency in this._dependants)) {
        this._dependants[dependency] = {};
      }
      this._dependants[dependency][moduleName] = true;
    });
  }

  get(moduleName) {
    return this._data[moduleName];
  }

  has(moduleName) {
    return moduleName in this._data;
  }

  ['delete'](moduleName) {
    if (moduleName in this._dependencies) {
      this._dependencies[moduleName].forEach((dependency) => {
        delete this._dependants[dependency][moduleName];
      });
      delete this._dependencies[moduleName];
    }
    delete this._data[moduleName];

    if (moduleName in this._synonyms) {
      const synonyms = this._synonyms[moduleName];
      synonyms.splice(synonyms.indexOf(moduleName), 1);

      if (synonyms.length === 1) {
        delete this._synonyms[synonyms[0]];
      }
      delete this._synonyms[moduleName];
    }
  }

  addSynonyms(...moduleNames) {
    let synonyms = [];

    moduleNames.forEach((moduleName) => {
      if (moduleName in this._synonyms) {
        if (!synonyms) {
          this._synonyms[moduleName].push.apply(this._synonyms[moduleName], synonyms);
          synonyms = this._synonyms[moduleName];
        } else if (synonyms !== this._synonyms[moduleName]) {
          throw new Error(`Module "${moduleName} already has synonyms to another modules!`);
        }
      } else {
        synonyms.push(moduleName);
      }
    });

    moduleNames.forEach((moduleName) => {
      this._synonyms[moduleName] = synonyms;
    });
  }

  getSynonyms(moduleName) {
    const synonyms = this._synonyms[moduleName] || [moduleName];
    return synonyms.filter(synonymModuleName => synonymModuleName in this._data);
  }

  getDependants(moduleName) {
    const that = this;

    if (!(moduleName in that._dependants)) {
      return [];
    }

    const result = [that._dependants[moduleName]];

    Object.keys(that._dependants[moduleName]).forEach(function getDependantsRecursively(dependant) {
      const dependants = that._dependants[dependant];

      if (result.indexOf(dependants) === 0) {
        result.push(dependants);
        Object.keys(dependants).forEach(getDependantsRecursively);
      }
    });

    return Object.keys(result.reduce((hash, dependants) => Object.assign(hash, dependants), {}));
  }
}
