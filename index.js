'use strict';

const ApiClient = require("./src/api-client");
const WsClient = require("./src/ws-client");

const API_KEY = 'UMhcLxu3Bqkwu6ZRylvti20V36lpCNH096IcTkvY3Xiq6sSg7ESTCYuU90FNr8pC';
const SECRET_KEY = 'E7xfrKpTifFurTXZIU0B78WvOpY9wZ0QUzsrqW4IyHbB6uodrQqqZ5YOuERpTdXX';

const API_URL = 'https://testnet.binance.vision/api';
const WS_URL = 'wss://testnet.binance.vision/ws';
const WS_STREAM_URL = 'wss://testnet.binance.vision/stream';

(async () => {
    const apiClient = new ApiClient(API_URL, API_KEY, SECRET_KEY);
    const wsClient = new WsClient(WS_URL);

    // obtain a fresh listenKey
    const {listenKey} = await apiClient.createListenKey();

    // keep listenKey alive by virtue of sending pings every 30 minutes
    setInterval(() => {
        apiClient.pingListenKey(listenKey);
    }, 30 * 60 * 1000);

    // establish ws connection
    await wsClient.connect(listenKey);

    console.log(await apiClient.getAllCoins());
})();
