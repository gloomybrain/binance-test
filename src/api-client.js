'use strict';

const Https = require('https');
const Url = require('url').URL;
const Path = require('path');
const Crypto = require('crypto');

class ApiClient {

    /**
     * @param {string} apiUrlBase
     * @param {string} apiKey
     * @param {string} secretKey
     */
    constructor(apiUrlBase, apiKey, secretKey) {

        /** @private */
        this._apiUrlBase = apiUrlBase;

        /** @private */
        this._apiKey = apiKey;

        /** @private */
        this._secretKey = secretKey;
    }

    /**
     * @returns {object}
     */
    createListenKey() {
        const path = '/api/v3/userDataStream';

        return this._makeRequest('POST', path, { });
    }

    /**
     * @param {string} listenKey
     * 
     * @returns {object}
     */
    pingListenKey(listenKey) {
        const path = '/api/v3/userDataStream';

        return this._makeRequest('PUT', path, { listenKey });
    }

    /**
     * @param {string} listenKey
     * 
     * @returns {object}
     */
    closeListenKey(listenKey) {
        const path = '/api/v3/userDataStream';

        return this._makeRequest('DELETE', path, { listenKey });
    }

    getServerTime() {
        const path = '/api/v3/time';

        return this._makeRequest('GET', path, {});
    }

    getExchangeInfo() {
        const path = '/api/v3/exchangeInfo';

        return this._makeRequest('GET', path, {});
    }

    async getAllCoins() {
        const path = '/sapi/v1/capital/config/getall';
        const {serverTime: timestamp} = await this.getServerTime();

        return this._makeSignedRequest('GET', path, { timestamp });
    }

    getSystemStatus() {
        const path = '/wapi/v3/systemStatus.html';

        return this._makeRequest('GET', path, {});
    }

    /**
     * @private
     *
     * @param {'GET' | 'POST' | 'PUT' | 'DELETE'} method
     * @param {string} path
     * @param {object} query
     * 
     * @returns {Promise<object>}
     */
    _makeSignedRequest(method, path, query) {
        const signedQuery = this._signQuery(query);

        return this._makeRequest(method, path, signedQuery);
    }

    /**
     * @private
     *
     * @param {'GET' | 'POST' | 'PUT' | 'DELETE'} method
     * @param {string} path
     * @param {object} query
     * 
     * @returns {Promise<object>}
     */
    _makeRequest(method, path, query) {
        const url = new Url(path, this._apiUrlBase);

        for (const [paramName, paramValue] of Object.entries(query)) {
            url.searchParams.set(paramName, paramValue);
        }

        const options = {
            method,
            headers: {
                'X-MBX-APIKEY': this._apiKey
            }
        };

        console.log(`HTTP ${method} ${url.href}`);

        return new Promise((resolve, reject) => {
            let buffer = '';
            const request = Https.request(url, options, incomingMessage => {
                const onData = chunk => buffer += chunk;

                incomingMessage.on('data', onData);
                incomingMessage.once('end', () => {
                    incomingMessage.removeListener('data', onData);

                    let data = '';
                    try {
                        data = JSON.parse(buffer);
                    }
                    catch (error) {
                        console.error(`Unable to parse data string: "${buffer}"`);
                    }

                    if (incomingMessage.statusCode > 299) {
                        const message = `${incomingMessage.statusCode} ${incomingMessage.statusMessage}`;
                        const error = new Error(message);

                        return reject(error);
                    }

                    console.log(data);

                    return resolve(data);
                });
            });

            const onError = (error) => {
                return reject(error);
            }

            request.once('error', onError);

            request.end();
        });
    }

    /**
     * @private
     *
     * @param {object} query
     *
     * @returns {object}
     */
    _signQuery(query) {
        const kvPairs = [];
        for (const [key, value] of Object.entries(query)) {
            kvPairs.push(`${key}=${value}`);
        }

        const kvString = kvPairs.join('&');

        const signature = Crypto
            .createHmac('sha256', this._secretKey)
            .update(kvString)
            .digest('hex');

        return { ...query, signature };
    }
}

module.exports = ApiClient;
