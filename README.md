# Tasks

- Log to console current non 0 asset balances available on the SPOT account (testnet)  
- Open a single userData websocket (with all the requirement logic to keep the listenKey active)
- Keep your local asset balances state up to date based on the data coming from userData
- Log the asset balances again on every balance change
- Open 10 *@trade websockets for the 10 pairs with the highest volume in the last 24h on the SPOT exchange (mainnet)
- Determinate the 10 pairs dynamically (no hard-coded pairs)
- Measure event time => client receive time latency and log (min/mean/max) to console every 1 minute
