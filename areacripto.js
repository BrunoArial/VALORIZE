async function getPrices() {
      const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,cardano,solana";
      const response = await fetch(url);
      const data = await response.json();

      const container = document.getElementById("coins");
      container.innerHTML = "";

      data.forEach(coin => {
        const div = document.createElement("div");
        div.className = "coin";
        div.innerHTML = `
          <img src="${coin.image}" alt="${coin.name}">
          <h3>${coin.name}</h3>
          <p> ${coin.current_price.toLocaleString()}</p>
          <p> ${coin.price_change_percentage_24h.toFixed(2)}%</p>
        `;
        container.appendChild(div);
      });
    }

    getPrices();