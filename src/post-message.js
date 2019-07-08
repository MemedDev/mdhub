/**
 * The MdHub uses messages sent via window.postMessage to
 * talk with each module.
 */
class PostMessage {
  constructor(MdHub) {
    this._MdHub = MdHub;

    this.lastMessage = null;
    // IE 8 and 9 can only sent postMessages with string data
    this.sendAsString = false;
  }

  /**
   * Verify if the actual browser can only sent postMessage using string data
   * @return {Boolean}
   */
  checkSendAsString() {
    if (navigator.appVersion.indexOf('MSIE 8') !== -1 || navigator.appVersion.indexOf('MSIE 9') !== -1) {
      this.sendAsString = true;
    }
  }

  /**
   * Handler for postMessage:message event
   * @param  {Object} event postMessage event data
   */
  receive(event) {
    var data;
    var hash;
    // Data of the message
    var message = event.data;
    var promise;
    var self = this;

    if (this.sendAsString) {
      message = JSON.parse(event.data);
    }

    if (!message || message.type !== 'command' && message.type !== 'event') {
      return;
    }

    // If the message target is the current instance
    if (message.to === 'broadcast' || message.to === this._MdHub.module.name) {
      if (message.type === 'command') {
        // If the message is secure, recover the data from sessionStorage
        if (message.secure && this._MdHub.hasStorage()) {
          hash = message.data;
          data = sessionStorage.getItem(hash);

          // The sessionStorage can be implemented asynchronously by the browser
          // Wait 100ms for the data
          if (data === undefined || data === null || data === 'undefined') {
            setTimeout(function recallReceive() {
              self.receive(event);
            }, 100);
            return;
          }

          if (data !== undefined && data !== 'undefined') {
            message.data = JSON.parse(data);
          } else {
            message.data = null;
          }

          sessionStorage.removeItem(hash);
        }

        // It's the response of a command sent
        if (message.callback) {
          promise = this._MdHub.command.callbacks[message.id];

          if (promise) {
            // The response can be delivered first than the callback definition
            if (typeof promise[message.callback] !== 'function') {
              setTimeout(function interval() {
                if (typeof promise[message.callback] === 'function') {
                  promise[message.callback].call(this, message.data, message);
                }

                delete this._MdHub.command.callbacks[message.id];
              }, 1);
            } else {
              promise[message.callback].call(this, message.data, message);
              delete this._MdHub.command.callbacks[message.id];
            }
          }
        } else {
          // Rejects the command if the module doesn't exists
          // @TODO: Console Warn
          if (! this._MdHub.command.list[message.name]) {
            this._MdHub.command.reject(message);
            return;
          }

          // Call the comand callback
          this._MdHub.command.list[message.name].call(this, message.data, function success(result) {
            self._MdHub.command.resolve(message, result);
          }, function error(result) {
            self._MdHub.command.reject(message, result);
          });
        }
      } else if (message.type === 'event') {
        this._MdHub.event.call(message.name, message.data, message);
      }
    } else if (message.from !== this._MdHub.module.name && this._MdHub.mode === 'server') {
      this._MdHub.postMessage.send(message);

      if (message.type === 'event') {
        this._MdHub.event.call(message.name, message.data, message);
      }
    }
  }

  /**
   * Send a postMessage
   * @param  {Object} message
   */
  send(message) {
    let i;
    let messageData = message;
    let target = messageData.to;
    let targetWindow = {};

    // On client mode, send the postMessage to the MdHub Server
    if (this._MdHub.mode === 'client') {
      messageData.from = this._MdHub.module.name;

      if (!messageData.id) {
        messageData.id = ++this._MdHub.command.commandId;
      }

      if (messageData.data && messageData.data.callbacks) {
        delete messageData.data.callbacks;
      }

      // Store the last message sent
      // Useful for debugging
      this.lastMessage = messageData;

      // If the module has callback for beforeMessageSend, call it
      if (this._MdHub.module.callbacks && this._MdHub.module.callbacks.hasOwnProperty('beforeMessageSend') && this._MdHub.module.callbacks.beforeMessageSend) {
        this._MdHub.module.callbacks.beforeMessageSend.call(this, messageData);
      }

      // MdHub Server not found
      if (window.parent.window === window) return;

      if (this.sendAsString) {
        messageData = JSON.stringify(messageData);
      }

      window.parent.window.postMessage(messageData, '*');

      return;
    }

    // On server mode, if the message has a target, send to it
    if (target) {
      if (this.sendAsString) {
        messageData = JSON.stringify(messageData);
      }

      // If the target is the server, broadcast the message
      if (target === 'hub') {
        window.postMessage(messageData, '*');
        return;
      }

      // If the target doesn't exists, reject the message
      if (! this._MdHub.module.list[target]) {
        this._MdHub.command.reject(messageData);
        return;
      }

      targetWindow = this._MdHub.module.list[target].window.contentWindow;

      if (targetWindow) {
        targetWindow.postMessage(messageData, '*');
      }

      return;
    }

    messageData.to = 'broadcast';

    if (this.sendAsString) {
      messageData = JSON.stringify(messageData);
    }

    // If the message doesn't has a target, broadcast it
    for (i in this._MdHub.module.list) {
      targetWindow = this._MdHub.module.list[i].window.contentWindow;

      if (targetWindow) {
        targetWindow.postMessage(messageData, '*');
      }
    }
  }
}

export default PostMessage;
