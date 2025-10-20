// Função para buscar os preços (seu código original)
async function getPrices() {
  const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&ids=bitcoin,ethereum,tether,usd-coin,binancecoin,ripple,cardano,dogecoin,polkadot,binance-usd,solana,avalanche-2,terra-luna-2,shiba-inu,dai,truusd,litecoin,uniswap,chainlink,cosmos,ethereum-classic,near-protocol,algorand,vechain,filecoin,monero,stellar,internet-computer,arbitrum,quant-network,elrond-erd-2,eos,hedera,flow,the-sandbox,decentraland,axie-infinity,tezos,aave,compound-ether,maker,fantom,terrausd,kusama,optimism,celo,harmony,chiliz,enjincoin,sushi";
  
  const response = await fetch(url);
  const data = await response.json();

  const container = document.getElementById("coins");
  container.innerHTML = ""; 

  // --- MAPA COMPLETO ---
  // Mapeia o 'id' da CoinGecko para o símbolo do TradingView.
  // Prioridade: par BRL. Se não existir, par USDT.
  const symbolMap = {
    'bitcoin': 'BINANCE:BTCBRL',
    'ethereum': 'BINANCE:ETHBRL',
    'tether': 'BINANCE:USDTBRL',
    'usd-coin': 'BINANCE:USDCBRL',
    'binancecoin': 'BINANCE:BNBBRL',
    'ripple': 'BINANCE:XRPBRL',
    'cardano': 'BINANCE:ADABRL',
    'dogecoin': 'BINANCE:DOGEBRL',
    'polkadot': 'BINANCE:DOTBRL',
    'binance-usd': 'BUSDUSD',
    'solana': 'BINANCE:SOLBRL',
    'avalanche-2': 'BINANCE:AVAXBRL',
    'terra-luna-2': 'OKX:LUNAUSD',
    'shiba-inu': 'BINANCE:SHIBBRL',
    'dai': 'COINBASE:DAIUSD',
    'truusd': 'BINANCE:TUSDBRL',
    'litecoin': 'BINANCE:LTCBRL',
    'uniswap': 'UNISWAP',
    'chainlink': 'BINANCE:LINKBRL',
    'cosmos': 'ATOMUSD',
    'ethereum-classic': 'ETCUSD',
    'near-protocol': 'BINANCE:NEARBRL',
    'algorand': 'ALGOUSD',
    'vechain': 'VETUSD',
    'filecoin': 'FILUSD',
    'monero': 'XMRUSD',
    'stellar': 'XLMUSD',
    'internet-computer': 'ICPUSD',
    'arbitrum': 'COINBASE:ARBUSD',
    'quant-network': 'COINBASE:QNTUSD',
    'elrond-erd-2': 'BINANCE:EGLDUSD',
    'eos': 'EOSUSD',
    'hedera': 'BINANCE:HBARBRL',
    'flow': 'FLOWUSD',
    'the-sandbox': 'SANDUSD',
    'decentraland': 'MANAUSD',
    'axie-infinity': 'AXSUSD',
    'tezos': 'BINANCE:XTZUSD',
    'aave': 'AAVEUSD',
    'compound-ether': 'CETH',          
    'maker': 'MKRUSD',
    'fantom': 'FTMUSD',
    'terrausd': 'USTCUSD',   
    'kusama': 'KSMUSD',     
    'optimism': 'OPUSD',
    'celo': 'CELOUSD',
    'harmony': 'ONEUSD',
    'chiliz': 'CHZUSD',
    'enjincoin': 'ENJUSD',
    'sushi': 'SUSHIUSD'
  };

  data.forEach(coin => {
    const priceChangeClass = coin.price_change_percentage_24h >= 0 ? "positive" : "negative";

    let tradingViewSymbol = symbolMap[coin.id]; 
    if (!tradingViewSymbol) {
        tradingViewSymbol = coin.symbol.toUpperCase();
    }

    const div = document.createElement("div");
    div.className = "coin";
    div.innerHTML = `
      <img src="${coin.image}" alt="${coin.name}">
      <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
      <p><b>Preço:</b> R$${coin.current_price.toLocaleString()}</p>
      <p class="${priceChangeClass}"><b>24h:</b> ${coin.price_change_percentage_24h.toFixed(2)}%</p>
      <p><b>Market Cap:</b> $${coin.market_cap.toLocaleString()}</p>
      <p><b>Volume 24h:</b> $${coin.total_volume.toLocaleString()}</p>
    `;

    div.addEventListener('click', () => {
        updateTradingViewWidget(tradingViewSymbol);
        window.scrollTo({ top: 600, behavior: 'smooth' });
    });

    container.appendChild(div);
  });
}

getPrices();
setInterval(getPrices, 30000);