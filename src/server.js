/**
 * When MdHub is running on the main page, it's in server mode
 */
class Server {
  constructor(MdHub) {
    this._MdHub = MdHub;
    this.bindEventsAlreadyRan = false;
  }

  /**
   * Post Message handler
   */
  registerEventMessage(messageData) {
    window.MdHub.postMessage.receive(messageData);
  }

  /**
   * Window Hash Change handler
   */
  registerEventHashchange() {
    window.MdHub.event.trigger('core:hashChange', window.location.hash);
  }

  /**
   * Initialize the default events for server mode
   */
  bindEvents() {
    let self = this;

    // Need to be a function because IE8
    window.addEventListener('message', this.registerEventMessage, false);
    window.addEventListener('hashchange', this.registerEventHashchange, false);

    if (this.bindEventsAlreadyRan) {
      return;
    }

    this.bindEventsAlreadyRan = true;

    // Events
    this._MdHub.event.listen('core:moduleInit', function moduleInit(data) {
      this._MdHub.module.init(data);
    });

    // Commands

    // Return the api key
    this._MdHub.command.add('core:getApiKey', function getApiKey(data, resolve) {
      resolve(this._MdHub.options.apiKey);
    });

    // Return the dictionary terms
    this._MdHub.command.add('core:getDictionary', function getDictionary(data, resolve) {
      resolve(this._MdHub.dict.getAll());
    });

    // Return the window.location from the main page
    this._MdHub.command.add('core:getLocation', function getLocation(data, resolve) {
      resolve({
        hash: window.location.hash,
        host: window.location.host,
        hostname: window.location.hostname,
        href: window.location.href,
        origin: window.location.origin,
        pathname: window.location.pathname,
        port: window.location.port,
        protocol: window.location.protocol,
      });
    });

    // Return the location hash from the main page
    this._MdHub.command.add('core:getLocationHash', function getLocationHash(data, resolve) {
      resolve(window.location.hash);
    });

    // Return the list of showing modules
    this._MdHub.command.add('core:getModulesShowing', function moduleShow(data, resolve) {
      resolve({ modules: Object.getOwnPropertyNames(this._MdHub.module.listShowing) });
    });

    this._MdHub.command.add('core:getOptions', function getUsuario(data, resolve) {
      resolve(this._MdHub.options);
    });

    // Return the module dependencies
    this._MdHub.command.add('core:getRequire', this._MdHub.module.getRequire);

    // Return if a module is showing
    this._MdHub.command.add('core:isModuleShowing', function moduleShow(data, resolve) {
      resolve(this._MdHub.module.listShowing.hasOwnProperty(data));
    });

    // Show a module
    this._MdHub.command.add('core:moduleShow', function moduleShow(data, resolve) {
      this._MdHub.module.show(data);
      resolve();
    });

    // Hide a module
    this._MdHub.command.add('core:moduleHide', function moduleHide(data, resolve) {
      this._MdHub.module.hide(data);
      resolve();
    });

    // Set a dictionary term
    this._MdHub.command.add('core:setDictionary', function setDictionary(data, resolve) {
      resolve(this._MdHub.dict.set(data));
    });

    // Change the location of the main page
    this._MdHub.command.add('core:setLocation', function setLocation(data, resolve) {
      var i;

      // Block if the new location doesn't contains the current domain
      if (window.location.hostname.indexOf(self.domain) === -1) {
        resolve();
        return;
      }

      for (i in data) {
        window.location[i] = data[i];
      }

      resolve();
    });

    // Set the location hash from the main page
    this._MdHub.command.add('core:setLocationHash', function setLocationHash(data, resolve) {
      window.location.hash = data;
      resolve();
    });

    // Apply new styles to the module iframe
    this._MdHub.command.add('core:updateModuleStyle', function updateModuleStyle(data, resolve) {
      this._MdHub.module.updateStyle(data);
      resolve();
    });

    /**
     * Set custom options for a module
     *
     * @param {string} module Module name (if false, will be global)
     * @param  {Object} data
     * Exemplo:
     * module = 'module.one'
     * data = {
     *   fullscreen:   true,
     *   primaryColor: '#576cff',
     *   minWidth:     '810px'
     * }
     */
    this._MdHub.command.add('core:setOptionsCustom', function setOptionsCustom(module, data, resolve) {
      var moduleName = module;

      if (Boolean(module) === false) {
        moduleName = 'global';
      }

      this.optionsCustom[moduleName] = data;
      resolve();
    });

    /**
     * Return custom global options for the modules
     *
     * @param {string} module Module name
     * @returns {Object}
     *
     * Exemplo:
     * {
     *    fullscreen:   true,
     *    primaryColor: '#576cff',
     *    minWidth:     '810px'
     * }
     */
    this._MdHub.command.add('core:getOptionsCustom', function getOptionsCustom(module, resolve) {
      var moduleName = module;

      if (Boolean(module) === false) {
        moduleName = 'global';
      }

      resolve(this._MdHub.optionsCustom[moduleName]);
    });

    /**
     * Change the iframe container position style ('relative', 'absolute')
     */
    this._MdHub.command.add('core:setIframeContainerPosition', function setIframeContainerPosition(position) {
      var iframeContainer;
      if (this._MdHub.optionsCustom.global.fullscreen === false) {
        iframeContainer = document.querySelector('#iframe-container');
        iframeContainer.style.position = position;
      }
    });
  }

  /**
  * Unbind message and hashchange events
  */
  unbindEvents() {
    window.removeEventListener('message', this.registerEventMessage, false);
    window.removeEventListener('hashchange', this.registerEventHashchange, false);
  }

  /**
   * Initialize the MdHub Server
   * @param  {Object} options Initialization options
   * Exemplo: {
   *    apiKey: 'API Key of the application',
   *    container: 'if-of-the-element-that-will-have-modules-iframes-inside',
   *    modules: ['module.one', 'module.two', 'module.three']
   *  }
   *
   */
  init(options) {
    let body;
    let containerId = options.container ? options.container : 'mdhub-auto-generated';
    let div;
    let i;
    let iframeContainer;
    let iframeContainerPosition = 'absolute';
    let modulePosition;
    let script;
    let height;

    this._MdHub.optionsCustom = {
      global: {
        fullscreen: true,
        primaryColor: '#576cff',
      },
    };

    // Search on page scripts who is mdhub
    for (i in document.scripts) {
      script = document.scripts[i].src;

      // Define the domain based on script domain
      if (! this._MdHub.domain && script && script.indexOf('mdhub') > 0) {
        script = script.replace('http://', '').replace('https://', '').replace('//', '').split('/');
        this._MdHub.domain = script[0];
        break;
      }
    }

    // Create the iframe container
    if (! document.getElementById(containerId)) {
      div = document.createElement('DIV');
      div.setAttribute('id', containerId);
      div.style.display = 'none';

      body = document.getElementsByTagName('body')[0];
      body.appendChild(div);
      options.container = containerId;
    } else {
      div = document.getElementById(options.container);
    }

    // If the container name is set, uses relative position
    if (options.container) {
      iframeContainerPosition = 'relative';
      this._MdHub.optionsCustom.global.fullscreen = false;
    }

    if (options.styles && options.styles.primaryColor) {
      this._MdHub.optionsCustom.global.primaryColor = options.styles.primaryColor;
    }

    this._MdHub.optionsCustom.global.container = options.container;

    iframeContainer = document.createElement('DIV');
    iframeContainer.setAttribute('id', 'iframe-container');
    iframeContainer.style.display = 'none';
    iframeContainer.style.position = iframeContainerPosition;
    iframeContainer.style.top = '0';
    iframeContainer.style.right = '0';
    iframeContainer.style.bottom = '0';
    iframeContainer.style.left = '0';
    iframeContainer.style.height = '100%';

    div.appendChild(iframeContainer);

    this._MdHub.module.name = 'hub';
    this._MdHub.module.build = options.build;
    this._MdHub.module.require = options.require || {};
    this._MdHub.module.version = options.version;
    this._MdHub.options = options;
    this._MdHub.mode = 'server';

    this.bindEvents();

    for (i in options.modules) {
      this._MdHub.module.add(options.modules[i]);
      modulePosition = 'static';

      if (this._MdHub.optionsCustom.global.fullscreen === false) {
        this._MdHub.module.updateStyle({
          moduleName: options.modules[i],
          styles: {
            position: modulePosition,
          },
        });
      }
    }
  }
}

export default Server;
