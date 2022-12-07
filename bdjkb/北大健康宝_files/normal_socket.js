function normal_socket(opts) {
    var defaultOpts = {
        debug: false,
        security: false,
        url: "",
        open: null,
        close: null,
        error: null,
        qrcode: null,
        log: null
    };
    if (typeof Object.assign != 'function') {
        Object.assign = function(target) {
            'use strict';
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            target = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
        };
    }
    this.opts = Object.assign({}, defaultOpts, opts);
    console.log(3333,this.opts.security)
    this.opts.url = (this.opts.security ? "wss" : "ws") + "://" + this.opts.url;
    this.init();
}


normal_socket.prototype = {
    constructor: normal_socket,
    sock: null,
    qrcode: null,
    init: function () {
        this.sock = new WebSocket(this.opts.url);
        var self = this;
        this.sock.onopen = function (evt) {
            self.log("socket conneted");
            if (self.opts.open) {
                self.opts.open.call(self, evt);
            }
        };
        this.sock.onclose = function (evt) {
            self.log("socket disconnected");
            if (self.opts.close) {
                self.opts.close.call(self, evt);
            }
            self.socket = null;
        };
        this.sock.onerror = function (evt) {
            self.log("socket error:");
            self.log(evt);
            if (self.opts.error) {
                self.opts.error(evt, 2);
                self.opts.error.call(self, evt);
            }
            self.socket = null;
        };
        this.sock.onmessage = function (message) {
            self.log("message:" + message.data);
            var data = JSON.parse(message.data);
            var evt = data.event;
            if (typeof self.opts[evt] == "undefined") {
                alert("未定义事件：" + evt);
                return;
            }
            self.opts[evt].call(self, data.data);
        }
    },

    callError: function (msg) {
        if (this.opts.error) {
            this.opts.error(msg, 1);
        } else {
            console.error(msg);
        }
    },
    send: function (data, error) {
        if (!this.sock) {
            console.error("socket closed");
            return false;
        }
        if (this.sock.readyState != 1) {
            console.error("connection is establishing or closed");
            return false;
        }
        return this.sock.send(data);
    },

    close: function () {
        if (this.sock) {
            this.sock.close();
        }
    },
    log: function (msg) {
        if (typeof this.opts.log == "function") {
            this.opts.log(msg);
        } else if (this.opts.debug) {
            console.log(msg);
        }
    }
}
