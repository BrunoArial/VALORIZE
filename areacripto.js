/* ============================================================
   ÁREA CRIPTO - Lógica de API e Gestão de Carteira Cripto
   ============================================================ */

const CRIPTO_STORAGE_KEY = 'financial-hub:cripto-wallet-v1';

// Gerenciador do Saldo do Usuário
const WalletCripto = {
  holdings: {},
  load() {
    try {
      const raw = localStorage.getItem(CRIPTO_STORAGE_KEY);
      if (raw) this.holdings = JSON.parse(raw);
    } catch (e) {}
  },
  save() {
    localStorage.setItem(CRIPTO_STORAGE_KEY, JSON.stringify(this.holdings));
  },
  set(id, amount) {
    if (amount <= 0) {
      delete this.holdings[id]; // Remove se for 0
    } else {
      this.holdings[id] = amount;
    }
    this.save();
  }
};
WalletCripto.load();

function updateTradingViewWidget(symbol) {
  const container = document.getElementById("tv-widget-container");
  if (!container) return;
  container.style.display = "block";
  container.innerHTML = "";
  const tvDiv = document.createElement("div");
  tvDiv.id = "tradingview_" + Math.random().toString(36).substring(7);
  tvDiv.style.height = "100%";
  tvDiv.style.width = "100%";
  container.appendChild(tvDiv);

  const script = document.createElement("script");
  script.src = "https://s3.tradingview.com/tv.js";
  script.async = true;
  script.onload = () => {
    new TradingView.widget({
      "autosize": true, "symbol": symbol, "interval": "D", "timezone": "America/Sao_Paulo",
      "theme": "light", "style": "1", "locale": "br", "enable_publishing": false,
      "hide_top_toolbar": false, "hide_legend": false, "save_image": false,
      "container_id": tvDiv.id
    });
  };
  container.appendChild(script);
}

// Cria um mini-gráfico em SVG dinâmico!
function createSparklineSVG(prices, isUp) {
  if (!prices || !prices.length) return '';
  const w = 60, h = 20;
  const min = Math.min(...prices), max = Math.max(...prices);
  const range = max - min || 1;
  const points = prices.map((p, i) => `${(i / (prices.length - 1)) * w},${h - ((p - min) / range) * h}`).join(' ');
  const color = isUp ? '#16a34a' : '#dc2626'; // Cores de sucesso/erro do seu CSS
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

async function getPrices() {
  // Adicionamos &sparkline=true no final da URL da CoinGecko
  const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&ids=bitcoin,ethereum,tether,usd-coin,binancecoin,ripple,cardano,dogecoin,polkadot,binance-usd,solana,avalanche-2,terra-luna-2,shiba-inu,dai,truusd,litecoin,uniswap,chainlink,cosmos,ethereum-classic,near-protocol,algorand,vechain,filecoin,monero,stellar,internet-computer,arbitrum,quant-network,elrond-erd-2,eos,hedera,flow,the-sandbox,decentraland,axie-infinity,tezos,aave,compound-ether,maker,fantom,terrausd,kusama,optimism,celo,harmony,chiliz,enjincoin,sushi&sparkline=true";
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    // 1. Atualiza a Aba Criptomoedas
    if (document.getElementById("coins")) {
      updateCriptoPage(data);
      bindCryptoForm(data);
    }

    // 2. Atualiza o Card no Dashboard (index.html)
    if (document.getElementById("kpi-preco-dinamico")) {
      updateDashboardKPI(data);
    }
  } catch (error) {
    console.error("Erro ao carregar dados da CoinGecko:", error);
  }
}

/* --- FUNÇÕES DA ABA CRIPTOMOEDAS --- */
function updateCriptoPage(data) {
  const container = document.getElementById("coins");
  container.innerHTML = ""; 

  const symbolMap = {
    'bitcoin': 'BINANCE:BTCBRL', 'ethereum': 'BINANCE:ETHBRL', 'solana': 'BINANCE:SOLBRL', 
    'dogecoin': 'BINANCE:DOGEBRL', 'cardano': 'BINANCE:ADABRL'
    // Mantive compacto, o TradingView aceita o TICKER+USD por padrão na linha abaixo
  };

  const formatCompact = (num) => {
    if(num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if(num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    return '$' + num.toLocaleString();
  };

  data.forEach(coin => {
    const isPositive = coin.price_change_percentage_24h >= 0;
    const priceChangeClass = isPositive ? "positive" : "negative";
    const sign = isPositive ? "+" : "";

    let tvSymbol = symbolMap[coin.id] || (coin.symbol.toUpperCase() + 'USD');

    // Verifica se o usuário tem saldo dessa moeda
    const amountOwned = WalletCripto.holdings[coin.id];
    let holdingBadge = '';
    if (amountOwned) {
      const val = amountOwned * coin.current_price;
      holdingBadge = `<div style="margin-top: 10px; background: var(--surface-2); padding: 8px; border-radius: 6px; font-size: 12px; display: flex; justify-content: space-between; border: 1px solid var(--border);">
                        <span>Sua carteira: <b>${amountOwned}</b></span>
                        <b style="color: var(--primary);">R$ ${val.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</b>
                      </div>`;
    }

    const div = document.createElement("div");
    div.className = "coin";
    div.innerHTML = `
      <div class="coin__header">
        <img src="${coin.image}" alt="${coin.name}">
        <div class="coin__title">
          <h3>${coin.name}</h3>
          <span>${coin.symbol.toUpperCase()}</span>
        </div>
      </div>
      <div class="coin__price">${coin.current_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
      <div class="coin__meta">
        <span>Variação 24h</span>
        <span class="coin__meta-value ${priceChangeClass}">${sign}${coin.price_change_percentage_24h.toFixed(2)}%</span>
      </div>
      <div class="coin__meta" style="border-top: none; padding-top: 4px;">
        <span>Volume</span>
        <span class="coin__meta-value" style="color: var(--text-muted);">${formatCompact(coin.total_volume)}</span>
      </div>
      ${holdingBadge}
    `;

    div.addEventListener('click', () => {
        updateTradingViewWidget(tvSymbol);
        document.getElementById('tv-widget-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    container.appendChild(div);
  });
}

function bindCryptoForm(data) {
  const form = document.getElementById('crypto-form');
  if (!form || form.dataset.bound) return;
  form.dataset.bound = true; 

  const select = document.getElementById('crypto-select');
  select.innerHTML = '<option value="" disabled selected>Selecione a moeda...</option>';
  
  // Preenche o Select ordenado por relevância
  data.forEach(coin => {
    const opt = document.createElement('option');
    opt.value = coin.id;
    opt.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
    select.appendChild(opt);
  });

  const feedback = document.getElementById('crypto-feedback');
  let feedbackTimer;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = select.value;
    const amountStr = document.getElementById('crypto-amount').value.replace(',', '.');
    const amount = parseFloat(amountStr);

    if (!id) {
      showFeedback('Selecione uma criptomoeda.', 'error');
      return;
    }
    if (isNaN(amount) || amount < 0) {
      showFeedback('Informe uma quantidade válida.', 'error');
      return;
    }

    WalletCripto.set(id, amount);
    updateCriptoPage(data); // Atualiza os cards
    document.getElementById('crypto-amount').value = '';
    
    // Se estiver no index.html junto (improvável, mas garante)
    if (document.getElementById("kpi-preco-dinamico")) updateDashboardKPI(data);
    
    showFeedback('Saldo atualizado! Veja o reflexo no seu Dashboard.', 'success');
  });

  function showFeedback(msg, kind) {
    feedback.textContent = msg;
    feedback.className = `form-feedback ${kind === 'error' ? 'is-error' : 'is-success'}`;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { feedback.textContent = ''; feedback.className = 'form-feedback'; }, 4000);
  }
}

/* --- FUNÇÃO DO DASHBOARD (index.html) --- */
function updateDashboardKPI(data) {
  const select = document.getElementById('seletor-moeda');
  const priceEl = document.getElementById('kpi-preco-dinamico');
  const imgEl = document.getElementById('kpi-imagem-dinamica');
  const amountEl = document.getElementById('kpi-crypto-amount');
  const sparkEl = document.getElementById('kpi-crypto-spark');
  
  let ownedIds = Object.keys(WalletCripto.holdings);
  
  // Preenche o Select apenas com as moedas que a pessoa POSSUI
  if (select.children.length === 0 || select.dataset.needsUpdate) {
    select.innerHTML = '';
    if (ownedIds.length === 0) {
      select.innerHTML = '<option value="bitcoin">Bitcoin (Sugestão)</option>';
      ownedIds = ['bitcoin']; // Padrão se não tiver nada
    } else {
      ownedIds.forEach(id => {
        const coin = data.find(c => c.id === id);
        if(coin) select.innerHTML += `<option value="${id}">${coin.name}</option>`;
      });
    }
    select.dataset.needsUpdate = false;
  }

  // Pega a moeda selecionada
  const selectedId = select.value || ownedIds[0];
  const coin = data.find(c => c.id === selectedId);
  
  if (coin) {
    const amountOwned = WalletCripto.holdings[selectedId] || 0;
    
    // Matemática mágica: Se ele tem saldo, mostra o valor total. Se não, mostra o preço unitário.
    let valorExibido = amountOwned > 0 ? (amountOwned * coin.current_price) : coin.current_price;
    
    imgEl.src = coin.image;
    imgEl.style.display = 'block';
    priceEl.textContent = valorExibido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    if (amountOwned > 0) {
      amountEl.textContent = `${amountOwned} ${coin.symbol.toUpperCase()}`;
    } else {
      amountEl.textContent = `Preço unitário`;
    }
    
    // Desenha o gráfico sutil de 7 dias
    const isUp = coin.price_change_percentage_24h >= 0;
    sparkEl.innerHTML = createSparklineSVG(coin.sparkline_in_7d.price, isUp);
  }
  
  // Se ele mudar no dropdown, atualiza na hora
  select.onchange = () => updateDashboardKPI(data);
}

// Inicia
getPrices();
setInterval(getPrices, 30000);