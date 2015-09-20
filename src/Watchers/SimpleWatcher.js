export const EVENTS = ['create', 'update', 'remove'];

export class SimpleWatcher {

  constructor(params) {
    this._subscribers = {};
    this._lastObserverId = 0;
    this._logger = params && 'logger' in params ? params.logger : SimpleWatcher.DEFAULT_LOGGER;
  }

  static get DEFAULT_LOGGER() {
    /* eslint-disable no-console */
    return message => console.log(message);
    /* eslint-enable no-console */
  }

  subscribe(observer) {
    const observerId = ++this._lastObserverId;
    this._subscribers[observerId] = observer;

    this.log(`New subscription ${observerId}`);

    return () => delete this._subscribers[observerId];
  }

  notify(event) {
    if (!('type' in event)) {
      throw new Error('Trying to notify with undefined event type!');
    }
    if (!('module' in event)) {
      throw new Error('Trying to notify with undefined module!');
    }

    if (EVENTS.indexOf(event.type) === -1) {
      throw new Error(`Trying to notify with unsupported event type "${event}"!`);
    }

    this.log(`${event.type}: ${event.module}`);

    Object.keys(this._subscribers).forEach((observerId) => {
      this._subscribers[observerId].next(event);
    });
  }

  notifyError(error) {
    this.log(`Error: ${error}`);

    Object.keys(this._subscribers).forEach((observerId) => {
      this._subscribers[observerId].error(error);
    });
  }

  log(message) {
    return this._logger && this._logger(message);
  }
}
