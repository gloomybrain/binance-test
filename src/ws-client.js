'use strict';

const EventEmitter = require('events').EventEmitter;
const Websocket = require('ws');
const Url = require('url').URL;
const Path = require('path');

class WsClient extends EventEmitter {

    /**
     * @returns {string}
     */
    static get MESSAGE() {
        return 'message';
    }

    /**
     * @param {string} wsBaseUrl
     */
    constructor(wsBaseUrl) {
        super();

        /** @private */
        this._wsBaseUrl = wsBaseUrl;

        /** @private */
        this._webSocket = null;
    }

    /**
     * @param {string} listenKey 
     * 
     * @returns {Promise<void>}
     */
    connect(listenKey) {
        const url = new Url(this._wsBaseUrl);
        url.pathname = Path.join(url.pathname, listenKey);

        console.log(`Connecting websocket to ${url.href}`);

        return new Promise(resolve => {
            this._webSocket = new Websocket(url);

            this._webSocket.on('open', () => {
                console.log(`WebSocket connected to ${url.href}`);

                return resolve();
            });

            this._webSocket.on('message', data => {
                super.emit(WsClient.MESSAGE, data);
            });
        });
    }
}

module.exports = WsClient;
