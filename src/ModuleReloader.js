export class ModuleReloader {

  constructor(loaderAdapter) {
    this._loaderAdapter = loaderAdapter;
  }

  replace(module, content = null) {
    const dependants = this.getDependants();

    this._loaderAdapter.remove(module);
    dependants.forEach(module => this._loaderAdapter.refresh(module));

    if (content !== null) {
      this._loaderAdapter.provide(module, content);
    }

    return Promise.all([module].concat(dependants).map(module => this._loaderAdapter.execute(module)));
  }
}