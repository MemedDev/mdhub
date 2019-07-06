import Client from './client';
import Command from './command';
import Dict from './dict';
import Event from './event';
import Module from './module';
import PostMessage from './post-message';
import Server from './server';

class MdHub {
  constructor() {
    this.debug = false;
    this.domain = null;
    this.modulesPath = '/modules'
    this.initialized = false;
    this.mode = 'server';
    this.options = {};

    this.client = new Client(this);
    this.command = new Command(this);
    this.dict = new Dict(this);
    this.event = new Event(this);
    this.module = new Module(this);
    this.postMessage = new PostMessage(this);
    this.server = new Server(this);
  }

  getLastMessage() {
    return this.postMessage.lastMessage;
  }

  hasStorage() {
    try {
      window.localStorage.setItem('test', 'test');
      window.localStorage.removeItem('test');
      return true;
    } catch (exception) {
      return false;
    }
  }

  init(options) {
    if (! this.initialized) {
      this.initialized = true;

      // Verify if the browser can only send data as string on postMessage
      this.postMessage.checkSendAsString();

      if (options.apiKey) {
        if (window.hasOwnProperty('module')) {
          options.build = window.module.build;
          options.version = window.module.version;
        }

        this.server.init(options);
      } else {
        this.client.init(options);
      }
    }
  }
}

export default new MdHub;
