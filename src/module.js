/**
 * Module attributes and methods.
 */
class Module {
  constructor(MdHub) {
    this._MdHub = MdHub;

    this.build = '0';
    // List of module commands
    this.commands = {};
    // List of events the module is listening
    this.events = {};
    // List of loaded modules (MdHub Server)
    this.list = {};
    // List of showing modules
    this.listShowing = {};
    // Module name (MdHub Client)
    this.name = '';
    // Module options (MdHub Client)
    this.options = {};
    // Module dependencies
    this.require = {};
    // Default module iframe style
    this.stylesDefault = {
      border: 'none',
      display: 'none',
      height: '100%',
      left: '0',
      overflow: 'auto',
      position: 'fixed',
      right: '0',
      width: '100%',
      // The max is 2147483647, subtracting 10 enables to have 10 layers of modules
      zIndex: '2147483637',
    };
    this.version = '0.0.0';
  }

  /**
   * Add a module
   * @param {String} name Module name
   * @param {String} url (optional) Module url
   */
  add(name, url) {
    var atributo;
    var iframe;
    var iframeContainer = document.getElementById('iframe-container');
    var iframeUrl = url;
    var moduleName;

    if (!name || typeof name !== 'string') {
      throw new Error('The "name" parameter is required and need to be a string');
    }

    moduleName = name.split('?')[0];

    if (this.list[moduleName]) return;

    if (!iframeUrl) {
      iframeUrl = '//' + this._MdHub.domain + this._MdHub.modulesPath + '/' + name + '/?_=' + Date.now();
    }

    // Create the module iframe
    iframe = document.createElement('IFRAME');
    iframe.setAttribute('id', 'mdhub-module-' + moduleName);
    iframe.setAttribute('name', moduleName);
    iframe.setAttribute('src', iframeUrl);

    // Apply the default iframe style
    for (atributo in this.stylesDefault) {
      iframe.style[atributo] = this.stylesDefault[atributo];
    }

    iframeContainer.appendChild(iframe);

    this.list[moduleName] = {
      window: iframe,
    };
  }

   /**
    * Verify if some module is showing.
    * If no module is showing, recover default page behavior.
    */
  checkListShowing() {
    if (Object.keys(this.listShowing).length === 0) {
      document.body.style.overflow = document.body.getAttribute('data-overflow') || 'visible';
      document.body.removeAttribute('data-overflow');
      document.getElementById('iframe-container').style.display = 'none';
    }
  }

  /**
   * Add module dependencies
   * @param  {Object} require List of modules
   */
  getRequire(require) {
    var i;

    if (!require) return;

    for (i = 0; i < require.length; i ++) {
      this._MdHub.module.add(require[i]);
    }
  }

  /**
   * Initializes a module
   * @param  {Object} options Init options
   */
  init(module) {
    let attribute;
    let moduleData;

    if (!module) {
      throw new Error('The "module" parameter is required');
    }

    moduleData = this._MdHub.module.list[module.name];

    // @TODO: manage better this situation, occurs when the module is the MdHub
    if (! moduleData) {
      throw new Error('The "' + module.name + '" module was not found.');
    }

    moduleData.version = module.version || 1;
    moduleData.build = module.build || 0;
    moduleData.options = module.options;
    moduleData.require = module.require;
    moduleData.window.allowtransparency = 'true';

    // Applies the styles sent on options
    if (moduleData.options && moduleData.options.styles) {
      for (attribute in moduleData.options.styles) {
        moduleData.window.style[attribute] = moduleData.options.styles[attribute];
      }
    }

    return moduleData;
  }

  /**
   * Show a module
   * @param  {String} name Module name
   */
  show(name) {
    var self = this;
    var overflowParent;

    if (!name) {
      throw new Error('The "name" parameter is required');
    }

    // On client mode, send a command to MdHub Server, which can control the
    // iframe display
    if (this._MdHub.mode === 'client') {
      this._MdHub.command.send('hub', 'core:moduleShow', name);
      return;
    }

    if (!this.list[name]) return;

    // On server mode, trigger an event
    this._MdHub.event.trigger('core:moduleShow', { moduleName: name });

    self.list[name].window.style.display = 'block';
    self.listShowing[name] = name;
    // Store the original page overflow, to recover when no modules are showing
    if (! document.body.getAttribute('data-overflow')) {
      overflowParent = document.body.style.overflow || 'visible';
      document.body.setAttribute('data-overflow', overflowParent);
    }

    if (this._MdHub.optionsCustom.global.fullscreen) {
      document.body.style.overflow = 'hidden';
    }

    document.getElementById('iframe-container').style.display = 'block';
  }

  /**
   * Hide a module
   * @param  {String} name Module name
   */
  hide(name) {
    if (!name) {
      throw new Error('The "name" parameter is required');
    }

    // On client mode, send a command to MdHub Server, which can control the
    // iframe display
    if (this._MdHub.mode === 'client') {
      this._MdHub.command.send('hub', 'core:moduleHide', name);
      return;
    }

    if (!this.list[name]) return;

    this.list[name].window.style.display = 'none';

    delete this.listShowing[name];

    // On server mode, trigger an event
    this._MdHub.event.trigger('core:moduleHide', {
      moduleName: name,
    });

    this.checkListShowing();
  }

  /**
   * Update the iframe style of a module
   * @param  {Object} data Object with style and module name
   * Exemplo:
   * data = {
   *  moduleName: 'module.one',
   *  styles: {
   *    zIndex: 1000
   *  }
   * }
   */
  updateStyle(data) {
    var atributo;

    for (atributo in data.styles) {
      this.list[data.moduleName].window.style[atributo] = data.styles[atributo];
    }
  }
}

export default Module;
