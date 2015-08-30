export class SimpleWatcher {

  constructor() {
    this._subscribers        = {};
    this._lastSubscriptionId = 0;
  }

  subscribe(callback) {
    const subscriptionId = ++this._lastSubscriptionId;
    this._subscribers[subscriptionId] = callback;
    return subscriptionId;
  }

  unsubscribe() {
    delete this._subscribers[Id];
  }

  notify(module, content) {
    for (let subscriptionId in this._subscribers) {
      if (this._subscribers.hasOwnProperty(subscriptionId)) {
        this._subscribers[subscriptionId](module, content);
      }
    }
  }
}