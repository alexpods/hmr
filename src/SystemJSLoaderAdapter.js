export class SystemJSLoaderAdapter {

  constructor(System) {
    this._System = System;
  }

  hook(name, hook) {
    const System  = this._System;

    if (!hook) {
      return System[name];
    }

    System[name] = hook;
  }

  resolve(name) {
    return this._System.normalizeSync(name);
  }

  uninstall(name) {
    this._System.delete(name);
  }

  import(name) {
    return this._System.import(name);
  }

  define(name, source) {
    this._System.define(name, source);
  }
}