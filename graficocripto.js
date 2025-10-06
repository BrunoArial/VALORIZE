new TradingView.widget(
{
    "width": "100%",
    "height": "100%",
    "symbol": "BINANCE:BTCBRL",
    "interval": "D",
    "timezone": "Etc/UTC",
    "theme": "dark",
    "style": "1",
    "locale": "br",
    "toolbar_bg": "#f1f3f6",
    "enable_publishing": false,
    "allow_symbol_change": true,
    "container_id": "tradingview_f7a6a",

    "exchanges": [
        "BINANCE",
        "MERCADOBTC",
        "COINBASE"  
    ],

    "types": [
        "crypto", 
        "forex"
    ],

    "symbols": [
        {"proName": "BINANCE:BTCBRL", "title": "Bitcoin / Real"},
        {"proName": "BINANCE:ETHBRL", "title": "Ethereum / Real"},
        {"proName": "BINANCE:XRPBRL", "title": "XRP / Real"},
        {"proName": "BINANCE:SOLBRL", "title": "Solana / Real"},
        {"proName": "BINANCE:DOGEBRL", "title": "Dogecoin / Real"}
    ]
}
);