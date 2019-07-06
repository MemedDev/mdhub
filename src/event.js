/**
 * Events are broadcasted messages. When a module needs to tell that something
 * happened, it triggers an event.
 *
 * This is based on Event Sourcing architecture.
 */
class Event {
  constructor(MdHub) {
    this._MdHub = MdHub;
    // List of events (+ handlers) this module is listening
    this.list = {};
  }

  /**
   * Listen to an event
   * @param {String}   name Event name
   * @param {Function} handler  Event Handler
   */
  add(name, handler) {
    console.warn('The function `event.add` will be deprecated on the next MdHub release. Please use `event.listen`');
    this.listen(name, handler);
  }

  /**
   * Triggers the handlers of an event
   * @param  {String} name Event name
   * @param  {Object} data Event data
   * @param  {Object} message Event message (received from post message)
   */
  call(name, data, message) {
    var i;

    if (!name || typeof name !== 'string') {
      throw new Error('The "name" parameter is required');
    }

    if (!this.list[name]) {
      return;
    }

    for (i = 0; i < this.list[name].length; i++) {
      if (typeof this.list[name][i] === 'function') {
        this.list[name][i].call(this, data, message);
      }
    }
  }

  /**
   * Listen to an event
   * @param {String}   name Event name
   * @param {Function} handler  Event Handler
   */
  listen(name, handler) {
    if (!name || !handler) {
      throw new Error('The parameters are required: name, handler');
    }

    if (!this.list[name]) {
      this.list[name] = [];
    }

    this.list[name].push(handler);
  }

  /**
   * Remove an event listener
   * @param  {String} name Event name
   */
  remove(name) {
    if (!name) {
      throw new Error('The "name" parameter is required');
    }

    delete this.list[name];
  }

  /**
   * Trigger an event
   * @param  {String} name Event name
   * @param  {Object} data Event data
   */
  trigger(name, data) {
    var postMessageObject = {
      data: data,
      from: this._MdHub.module.name,
      name: name,
      type: 'event',
      version: this._MdHub.module.version + '.' + this._MdHub.module.build,
    };

    if (!name) {
      throw new Error('The "name" parameter is required');
    }

    // Send the event to all modules (broadcast)
    this._MdHub.postMessage.send(postMessageObject);

    // The event is sent using postMessage (by MdHub Server) to all modules.
    // Because MdHub Server is not a module, we need to trigger the handlers manually.
    if (this._MdHub.mode === 'server') {
      this.call(name, data, postMessageObject);
    }
  }
}

export default Event;
