/**
 * In CQRS, commands and queries are different things. In MdHub, the only
 * difference is that a command can be replied with or without data, acting like
 * a merge of CQRS command and query.
 *
 * Every command has a source (module) and a target (module), and every command will
 * generate a promise, which can be resolved or rejected with/without data.
 */
class Command {
  constructor(MdHub) {
    this._MdHub = MdHub;

    // List of callbacks for sent commands (waiting the promise be resolved)
    this.callbacks = {};
    // Every command has a unique ID, this variable is incremented after a command
    // was sent
    this.commandId = 0;
    // List of commands which this module can receive
    this.list = {};
  }

  /**
   * Add a new command
   * @param {String}   name     Command name
   * @param {Function} callback Command function (receives three parameters, data, resolve and reject)
   */
  add(name, callback) {
    if (!name || !callback) {
      throw new Error('Parameters required: name, callback');
    }

    this.list[name] = callback;
  }

  /**
   * Alias for ping command
   * @param {String}   target     Target module to receive the ping
   */
  ping(target) {
    if (!target) {
      throw new Error('The "target" parameter is required');
    }

    return this.send(target, 'core:ping');
  }

  /**
   * Callback for a rejected command
   * @param  {Object} message      Received command message (via post message)
   * @param  {Object} responseData Data about why the command was rejected
   */
  reject(message, responseData) {
    var id;
    var name;
    var to;

    if (!message) {
      throw new Error('The "message" parameter is required');
    }

    id = message.id;
    name = message.name;
    to = message.from;

    this._MdHub.postMessage.send({
      callback: 'reject',
      data: responseData,
      id: id,
      name: name,
      to: to,
      type: 'command',
    });
  }

  /**
   * Removes a command
   * @param  {String} name Command name
   */
  remove(name) {
    if (!name) {
      throw new Error('The "name" parameter is required');
    }

    delete this.list[name];
  }

  /**
   * Callback for a resolved command
   * @param  {Object} message      Received command message (via post message)
   * @param  {Object} responseData Data for the command response
   */
  resolve(message, responseData) {
    var hash;
    var messageCallback;

    if (!message) {
      throw new Error('The "message" parameter is required');
    }

    messageCallback = {
      callback: 'resolve',
      data: responseData,
      from: this._MdHub.module.name,
      id: message.id,
      name: message.name,
      to: message.from,
      type: 'command',
      version: this._MdHub.module.version + '.' + this._MdHub.module.build,
    };

    // If the command was received on a secure message, the response needs to be secure too
    if (message.secure && this._MdHub.hasStorage()) {
      // Don't only use `Date.now()`, hash collision risk for messages recorded on sessionStorage
      // Don't only use `module.name` and `id`, previsibility risk for key used on sessionStorage
      hash = Date.now().toString() + this._MdHub.module.name + message.id.toString();
      sessionStorage.setItem(hash, JSON.stringify(responseData));

      messageCallback.data = hash;
      messageCallback.secure = true;
    }

    this._MdHub.postMessage.send(messageCallback);
  }

  /**
   * Send a command
   * @param  {String} commandTarget Module name
   * @param  {String} commandName   Command name
   * @param  {Object} commandData   Command data
   * @return {Object}               Promise
   */
  send(commandTarget, commandName, commandData, secure) {
    var hash;
    // Default pattern for command message
    var message = {
      data: commandData,
      from: this._MdHub.module.name,
      id: (++ this.commandId),
      name: commandName,
      to: commandTarget,
      type: 'command',
      version: this._MdHub.module.version + '.' + this._MdHub.module.build,
    };

    var promise = {
      then: function then(resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
      },
      reject: function reject() {},
      resolve: function resolve() {},
    };

    if (commandTarget === undefined || commandName === undefined) {
      throw new Error('Parameters required: commandTarget, commandName');
    }

    this._MdHub.command.callbacks[this.commandId] = promise;

    if (secure && this._MdHub.hasStorage()) {
      // Don't only use `Date.now()`, hash collision risk for messages recorded on sessionStorage
      // Don't only use `module.name` and `id`, previsibility risk for key used on sessionStorage
      hash = Date.now().toString() + this._MdHub.module.name + message.id.toString();
      sessionStorage.setItem(hash, JSON.stringify(commandData));

      message.data = hash;
      message.secure = true;
    }

    this._MdHub.postMessage.send(message);

    return promise;
  }
};

export default Command;
