/**
 * When MdHub is running inside an iframe module, it's in client mode
 */
class Client {
  constructor(MdHub) {
    this._MdHub = MdHub;
  }

  /**
   * Bind the default commands for client mode
   * @param  {Object} commands List of commands, like {commandName: callbackFunction}
   */
  bindCommands(commands) {
    var command;
    var self = this;

    this._MdHub.command.add('core:authenticate', function add(data, resolve) {
      resolve(self._MdHub.module.options.authenticate);
    });

    this._MdHub.command.add('core:ping', function ping(data, resolve) {
      resolve(true);
    });

    if (!commands) return;

    for (command in commands) {
      this._MdHub.command.add(command, commands[command]);
    }
  }

  /**
   * Bind the default events for the client mode
   * @param  {Object} events List of events, like {eventName: handlerFunction}
   */
  bindEvents(events) {
    var event;
    var self = this;

    window.addEventListener('message', (messageData) => {
      self._MdHub.postMessage.receive(messageData);
    }, false);

    if (!events) return;

    for (event in events) {
      this._MdHub.event.listen(event, events[event]);
    }
  }

  /**
   * Initializes the MdHub client mode
   * @param  {Object} options Initialization options
   * Example:
   *  {
   *    name: 'Module Name',
   *    version: 'Module Version',
   *    build: 'Module Build Number'
   *    options: {
   *      style: { // Iframe style
   *        background: 'transparent',
   *        border: '10px solid black'
   *      },
   *      transparent: true, // Turn the module transparent
   *      authenticate: true // If the module requires user authentication
   *    },
   *    events: {},
   *    commands: {},
   *    require: []
   *  }
   */
  init(module) {
    if (this._MdHub.debug) {
      console.log('module.init', module);
    }

    // Name for module is required
    if (! module.name) {
      throw new Error('MdHub Module Init Error: Please declare the name of the module');
    }

    // MdHub is initialized as Client, configuring all attributes
    this._MdHub.mode = 'client';
    this._MdHub.module.build = module.build || 0;
    this._MdHub.module.callbacks = module.callbacks || {};
    this._MdHub.module.commands = module.commands || {};
    this._MdHub.module.events = module.events || {};
    this._MdHub.module.name = module.name;
    this._MdHub.module.options = module.options || {};
    this._MdHub.module.require = module.require || {};
    this._MdHub.module.version = module.version || 1;

    if (module.require) {
      this._MdHub.command.send('hub', 'core:getRequire', MdHub.module.require);
    }

    this.bindEvents(module.events);
    this.bindCommands(module.commands);

    // After bind, we don't need more this attributes
    delete module.events;
    delete module.commands;

    // Trigger the core:moduleInit event, telling that this module was initialized
    this._MdHub.event.trigger('core:moduleInit', module);
  }
}

export default Client;
