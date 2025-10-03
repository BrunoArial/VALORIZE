async function getPrices() {
  const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,usd-coin,binancecoin,ripple,cardano,dogecoin,polkadot,binance-usd,solana,avalanche-2,terra-luna-2,shiba-inu,dai,truusd,litecoin,uniswap,chainlink,cosmos,ethereum-classic,near-protocol,algorand,vechain,filecoin,monero,stellar,internet-computer,arbitrum,quant-network,elrond-erd-2,eos,hedera,flow,the-sandbox,decentraland,axie-infinity,tezos,aave,compound-ether,maker,fantom,terrausd,kusama,optimism,celo,harmony,chiliz,enjincoin,sushi";
  
  const response = await fetch(url);
  const data = await response.json();

  const container = document.getElementById("coins");
  container.innerHTML = "";

  data.forEach(coin => {
    const priceChangeClass = coin.price_change_percentage_24h >= 0 ? "positive" : "negative";

    const div = document.createElement("div");
    div.className = "coin";
    div.innerHTML = `
      <img src="${coin.image}" alt="${coin.name}">
      <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
      <p><b>Rank:</b> #${coin.market_cap_rank}</p>
      <p><b>Preço:</b> $${coin.current_price.toLocaleString()}</p>
      <p class="${priceChangeClass}"><b>24h:</b> ${coin.price_change_percentage_24h.toFixed(2)}%</p>
      <p><b>Market Cap:</b> $${coin.market_cap.toLocaleString()}</p>
      <p><b>Volume 24h:</b> $${coin.total_volume.toLocaleString()}</p>
    `;
    container.appendChild(div);
  });
}

getPrices();
setInterval(getPrices, 30000);
