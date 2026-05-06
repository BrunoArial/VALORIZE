/* ============================================================
   Financial Hub — Lógica Principal (Dashboard, Cashflow, RF)
   ============================================================ */

(() => {
  'use strict';

  // 1. TEMA E CORES DO CSS
  const css = getComputedStyle(document.documentElement);
  const cssVar = (name, fallback) => (css.getPropertyValue(name).trim() || fallback);

  const THEME = {
    primary:    cssVar('--primary', '#00529B'),
    accent:     cssVar('--accent', '#f59e0b'),
    success:    cssVar('--success', '#16a34a'),
    danger:     cssVar('--danger', '#dc2626'),
    text:       cssVar('--text', '#0f172a'),
    textMuted:  cssVar('--text-muted', '#64748b'),
    textSubtle: cssVar('--text-subtle', '#94a3b8'),
    border:     cssVar('--border', '#e6e8ec'),
    surface:    cssVar('--surface', '#ffffff'),
  };

  // 2. DADOS DE MERCADO (Mock para visualização de Tabela)
  const MARKET_DATA = [
    { ticker: 'IBOV',  name: 'Ibovespa',          price: 132845.10, change:  0.84, spark: [128, 129, 130, 129, 131, 132, 132] },
    { ticker: 'IFIX',  name: 'Índice de FIIs',    price:   3412.55, change:  0.21, spark: [3380, 3390, 3395, 3400, 3402, 3408, 3412] },
    { ticker: 'USD',   name: 'Dólar comercial',   price:      5.18, change: -0.42, spark: [5.22, 5.21, 5.20, 5.21, 5.19, 5.19, 5.18] },
    { ticker: 'EUR',   name: 'Euro',              price:      5.61, change:  0.15, spark: [5.55, 5.57, 5.58, 5.59, 5.60, 5.60, 5.61] },
  ];

  const TX_ICONS = {
    wallet:    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H4a2 2 0 010-4h14v4"/><path d="M20 12a2 2 0 100 4v4H4a2 2 0 01-2-2V6"/><circle cx="16" cy="14" r="1"/></svg>',
    chart:     '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-6"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
    home:      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
    gift:      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18M12 8v13M7 8a3 3 0 010-6c2 0 5 4 5 6M17 8a3 3 0 000-6c-2 0-5 4-5 6"/></svg>',
    cart:      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2.6 11.6A2 2 0 009.6 17H18l3-9H6"/></svg>',
    bolt:      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
    heart:     '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 9a5 5 0 00-9-3 5 5 0 00-9 3c0 6 9 12 9 12s9-6 9-12z"/></svg>',
    car:       '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M5 17l1.5-5.5A2 2 0 018.4 10h7.2a2 2 0 011.9 1.5L19 17M5 17v3M19 17v3"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="17" r="1.5"/></svg>',
    play:      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 4 20 12 6 20 6 4"/></svg>',
    card:      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 11h18"/></svg>',
  };

  // 3. UTILITÁRIOS
  const fmtBRL = (v, opts = {}) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', ...opts });
  const fmtNumber = (v, digits = 2) => v.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const fmtPct = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2).replace('.', ',')}%`;
  function cryptoId() { return window.crypto?.randomUUID ? window.crypto.randomUUID() : 't_' + Math.random().toString(36).slice(2); }
  function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function parseDate(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
  function formatDateBR(iso) { const d = parseDate(iso); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; }
  
  function pickIcon(desc, category) {
    const haystack = `${desc || ''} ${category || ''}`.toLowerCase();
    const rules = [
      [/(aluguel|moradia|casa|imóvel|imovel)/, 'home'], [/(salário|salario|sálario|payroll|holerite|renda fixa)/, 'wallet'],
      [/(investiment|dividendo|cdb|tesouro|ações|acoes|bolsa|cripto|bitcoin|cdi|ifix|ibov)/, 'chart'], [/(freelance|consultor|projeto|extra|bônus|bonus)/, 'briefcase'],
      [/(cashback|prêmio|premio|presente|gift|bonificação)/, 'gift'], [/(supermercado|mercado|aliment|restaurante|comida|padaria|delivery)/, 'cart'],
      [/(luz|energia|água|agua|internet|gás|gas|condomínio|condominio|utilidade)/, 'bolt'], [/(saúde|saude|médico|medico|farmácia|farmacia|consulta|hospital|plano de saúde)/, 'heart'],
      [/(combust|gasolina|uber|99|transporte|carro|veículo|veiculo|estacionamento)/, 'car'], [/(streaming|netflix|spotify|cinema|lazer|entretenimento)/, 'play'],
      [/(cartão|cartao|fatura|crédito|credito)/, 'card']
    ];
    for (const [re, key] of rules) if (re.test(haystack)) return key;
    return 'wallet';
  }

  // NOVA FUNÇÃO: Formata o eixo Y corretamente com "k" e "M" para não bugar o Canvas
  function formatAxisVal(val) {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1).replace('.0', '')}M`;
    if (val >= 1000) return `R$ ${(val / 1000).toFixed(1).replace('.0', '')}k`;
    return `R$ ${Math.round(val)}`;
  }

  // 4. MOTORES DE GRÁFICOS (Canvas)
  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = Math.max(1, Math.round(rect.width  * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    return { ctx, w: rect.width, h: rect.height };
  }

  function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.length === 3 ? h.slice(0, 1).repeat(2) : h.slice(0, 2), 16);
    const g = parseInt(h.length === 3 ? h.slice(1, 2).repeat(2) : h.slice(2, 4), 16);
    const b = parseInt(h.length === 3 ? h.slice(2, 3).repeat(2) : h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function drawLineChart(canvas, { labels, series }) {
    const { ctx, w, h } = setupCanvas(canvas);
    const padding = { top: 16, right: 16, bottom: 28, left: 60 }; // Aumentado para 60
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const allValues = series.flatMap((s) => s.data);
    const min = Math.min(...allValues), max = Math.max(...allValues), range = max - min || 1;
    const yMin = min - range * 0.08, yMax = max + range * 0.08, yRange = yMax - yMin;

    const xAt = (i) => padding.left + (chartW * i) / (labels.length - 1);
    const yAt = (v) => padding.top + chartH - ((v - yMin) / yRange) * chartH;

    ctx.strokeStyle = THEME.border; ctx.lineWidth = 1; ctx.fillStyle = THEME.textSubtle;
    ctx.font = '11px Inter, system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH * i) / 4;
      const value = yMax - (yRange * i) / 4;
      ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(padding.left + chartW, y); ctx.stroke();
      ctx.fillText(formatAxisVal(value), padding.left - 8, y);
    }

    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    labels.forEach((label, i) => { ctx.fillText(label, xAt(i), padding.top + chartH + 8); });

    series.forEach((s) => {
      if (s.fill) {
        const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        grad.addColorStop(0, hexToRgba(s.color, 0.22)); grad.addColorStop(1, hexToRgba(s.color, 0.0));
        ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(xAt(0), yAt(s.data[0]));
        s.data.forEach((v, i) => ctx.lineTo(xAt(i), yAt(v)));
        ctx.lineTo(xAt(s.data.length - 1), padding.top + chartH); ctx.lineTo(xAt(0), padding.top + chartH);
        ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = s.color; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.setLineDash(s.dashed ? [5, 5] : []);
      ctx.beginPath();
      s.data.forEach((v, i) => { if (i === 0) ctx.moveTo(xAt(i), yAt(v)); else ctx.lineTo(xAt(i), yAt(v)); });
      ctx.stroke(); ctx.setLineDash([]);
      
      if (s.fill) {
        ctx.fillStyle = THEME.surface; ctx.strokeStyle = s.color; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(xAt(s.data.length - 1), yAt(s.data[s.data.length - 1]), 4.5, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
    });
  }

  function drawBarChart(canvas, { labels, groups }) {
    const { ctx, w, h } = setupCanvas(canvas);
    const padding = { top: 16, right: 16, bottom: 28, left: 60 }; // Aumentado para 60
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const max = Math.max(...groups.flatMap((g) => g.data)) * 1.15 || 1;
    const groupWidth = chartW / labels.length;
    const barGap = 6;
    const barWidth = (groupWidth - barGap * (groups.length + 1)) / groups.length;

    ctx.strokeStyle = THEME.border; ctx.fillStyle = THEME.textSubtle;
    ctx.font = '11px Inter, system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH * i) / 4;
      const value = max - (max * i) / 4;
      ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(padding.left + chartW, y); ctx.stroke();
      ctx.fillText(formatAxisVal(value), padding.left - 8, y);
    }

    labels.forEach((label, i) => {
      const groupX = padding.left + groupWidth * i;
      groups.forEach((g, j) => {
        const barH = (g.data[i] / max) * chartH;
        const x = groupX + barGap + j * (barWidth + barGap);
        const y = padding.top + chartH - barH;
        const r = Math.min(4, barWidth / 2, barH);
        ctx.fillStyle = g.color; ctx.beginPath();
        ctx.moveTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.lineTo(x + barWidth - r, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r); ctx.lineTo(x + barWidth, padding.top + chartH);
        ctx.lineTo(x, padding.top + chartH); ctx.closePath(); ctx.fill();
      });
      ctx.fillStyle = THEME.textSubtle; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(label, groupX + groupWidth / 2, padding.top + chartH + 8);
    });
  }

  function buildSparkline(values, isUp) {
    if(!values || !values.length) return '';
    const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
    const points = values.map((v, i) => `${(i / (values.length - 1)) * 80},${24 - ((v - min) / range) * 24}`).join(' ');
    const color = isUp ? THEME.success : THEME.danger;
    return `<svg class="spark" width="80" height="24" viewBox="0 0 80 24" aria-hidden="true"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  // 5. BANCO DE DADOS LOCAL (LocalStorage)
  const CF_STORAGE_KEY = 'financial-hub:cashflow-tx-v2';
  const CF_RANGE_KEY   = 'financial-hub:cashflow-range';
  const RF_STORAGE_KEY = 'financial-hub:renda-fixa-v1';

  const CF = {
    transactions: [], range: 'monthly',
    load() {
      try { const r = localStorage.getItem(CF_STORAGE_KEY); if (r) this.transactions = JSON.parse(r) || []; } catch (_) {}
      try { const rg = localStorage.getItem(CF_RANGE_KEY); if (rg) this.range = rg; } catch (_) {}
    },
    persist() { try { localStorage.setItem(CF_STORAGE_KEY, JSON.stringify(this.transactions)); } catch (_) {} },
    persistRange() { try { localStorage.setItem(CF_RANGE_KEY, this.range); } catch (_) {} },
    add(tx) { this.transactions.push(tx); this.persist(); },
    remove(id) { this.transactions = this.transactions.filter((t) => t.id !== id); this.persist(); },
    setRange(r) { this.range = r; this.persistRange(); },
  };

  const RF = {
    investments: [],
    load() { try { const r = localStorage.getItem(RF_STORAGE_KEY); if (r) this.investments = JSON.parse(r) || []; } catch (_) {} },
    persist() { try { localStorage.setItem(RF_STORAGE_KEY, JSON.stringify(this.investments)); } catch (_) {} },
    add(inv) { this.investments.push(inv); this.persist(); },
    remove(id) { this.investments = this.investments.filter(i => i.id !== id); this.persist(); }
  };

  function buildBuckets(range) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const buckets = [];
    const mNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    if (range === 'monthly') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        buckets.push({ label: `${mNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, match: (tx) => parseDate(tx.date).getFullYear() === d.getFullYear() && parseDate(tx.date).getMonth() === d.getMonth() });
      }
    } else if (range === 'quarterly') {
      const currQ = Math.floor(today.getMonth() / 3), currY = today.getFullYear();
      for (let i = 3; i >= 0; i--) {
        let q = currQ - i, y = currY; while (q < 0) { q += 4; y -= 1; }
        buckets.push({ label: `T${q + 1}/${String(y).slice(2)}`, match: (tx) => parseDate(tx.date).getFullYear() === y && Math.floor(parseDate(tx.date).getMonth() / 3) === q });
      }
    } else { 
      for (let i = 4; i >= 0; i--) {
        const y = today.getFullYear() - i;
        buckets.push({ label: `${y}`, match: (tx) => parseDate(tx.date).getFullYear() === y });
      }
    }
    return buckets;
  }

  function aggregateByRange(range) {
    const buckets = buildBuckets(range);
    const result = { labels: buckets.map(b => b.label), income: new Array(buckets.length).fill(0), expense: new Array(buckets.length).fill(0) };
    CF.transactions.forEach((tx) => buckets.forEach((b, i) => {
      if (b.match(tx)) tx.type === 'income' ? result.income[i] += tx.amount : result.expense[i] += tx.amount;
    }));
    return result;
  }

  // 6. INTEGRAÇÃO API BANCO CENTRAL (Selic e IPCA)
  async function fetchEconomia() {
    const kpiValorEl = document.getElementById('kpi-valor-economia');
    const kpiPeriodoEl = document.getElementById('kpi-periodo-economia');
    const seletorEconomia = document.getElementById('seletor-economia');
    
    if (!kpiValorEl || !seletorEconomia) return;

    const endpoints = {
      selic: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/1?formato=json',
      ipca: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/1?formato=json'
    };

    const updateEconomiaCard = async () => {
      const tipo = seletorEconomia.value;
      kpiValorEl.textContent = 'Carregando...';
      
      try {
        const response = await fetch(endpoints[tipo]);
        const data = await response.json();
        
        if (data && data.length > 0) {
          const valorFormatado = parseFloat(data[0].valor).toFixed(2).replace('.', ',');
          kpiValorEl.textContent = `${valorFormatado}%`;
          
          if (tipo === 'selic') {
             kpiPeriodoEl.textContent = `Taxa ao dia (Ref: ${data[0].data})`;
          } else {
             kpiPeriodoEl.textContent = `Taxa no mês (Ref: ${data[0].data})`;
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Banco Central:", error);
        kpiValorEl.textContent = 'Erro';
        kpiPeriodoEl.textContent = 'Indisponível no momento';
      }
    };

    seletorEconomia.addEventListener('change', updateEconomiaCard);
    updateEconomiaCard();
  }

  // 7. RENDERIZAÇÃO: DASHBOARD (index.html)
  let dashCashflowRange = 'monthly';
  
  function renderAll() {
    CF.load(); RF.load(); 
    
    const agg = aggregateByRange('monthly'); 
    const cIdx = agg.income.length - 1;
    const currentIncome = agg.income[cIdx] || 0;
    const currentExpense = agg.expense[cIdx] || 0;
    const prevIncome = agg.income[cIdx - 1] || 0;
    const prevExpense = agg.expense[cIdx - 1] || 0;

    const kpiIncomeEl = document.querySelector('[data-kpi="income"] .kpi__value');
    if (kpiIncomeEl) kpiIncomeEl.textContent = fmtBRL(currentIncome, { minimumFractionDigits: 2 });
    
    const kpiExpenseEl = document.querySelector('[data-kpi="expense"] .kpi__value');
    if (kpiExpenseEl) kpiExpenseEl.textContent = fmtBRL(currentExpense, { minimumFractionDigits: 2 });

    const updateTrend = (kpiName, curr, prev) => {
      const trendEl = document.querySelector(`[data-kpi="${kpiName}"] .trend`);
      if (!trendEl) return;
      if (prev === 0) {
        trendEl.textContent = curr > 0 ? '+ 100%' : '0,00%';
        trendEl.className = `trend ${curr > 0 ? 'trend--up' : ''}`;
      } else {
        const diff = ((curr - prev) / prev) * 100;
        trendEl.textContent = `${diff >= 0 ? '+ ' : '- '}${Math.abs(diff).toFixed(2).replace('.', ',')}%`;
        trendEl.className = `trend ${diff >= 0 ? 'trend--up' : 'trend--down'}`;
      }
    };
    updateTrend('income', currentIncome, prevIncome);
    updateTrend('expense', currentExpense, prevExpense);

    const totalRF = RF.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const perfCanvas = document.getElementById('chart-performance');
    if (perfCanvas) {
      const dataPortfolio = [], dataCDI = [];
      for (let i = 11; i >= 0; i--) {
        dataPortfolio.push(totalRF === 0 ? 0 : totalRF / Math.pow(1.01, i));
        dataCDI.push(totalRF === 0 ? 0 : totalRF / Math.pow(1.0085, i));
      }
      drawLineChart(perfCanvas, { 
        labels: agg.labels.map(l => l.split('/')[0]), 
        series: [
          { data: dataPortfolio, color: THEME.primary, fill: true }, 
          { data: dataCDI, color: THEME.accent, dashed: true }
        ] 
      });
    }

    renderDashCashflow();

    // Aqui a tabela de Índices é montada na Visão Geral
    const tbodyMarket = document.querySelector('#market-table tbody');
    if (tbodyMarket) {
      tbodyMarket.innerHTML = MARKET_DATA.map(m => {
        const isUp = m.change >= 0;
        return `<tr><td><div class="asset"><span class="asset__mark">${m.ticker.slice(0, 3)}</span><div><div class="asset__name">${m.ticker}</div><div class="asset__sub">${m.name}</div></div></div></td><td class="num">${m.ticker==='CDI'?fmtNumber(m.price):fmtBRL(m.price)}</td><td class="num"><span class="trend ${isUp ? 'trend--up' : 'trend--down'}">${fmtPct(m.change)}</span></td><td class="num hide-sm">${buildSparkline(m.spark, isUp)}</td></tr>`;
      }).join('');
    }

    // Aciona a busca no Banco Central para preencher o Card
    fetchEconomia();
  }

  function renderDashCashflow() {
    const canvasDash = document.getElementById('chart-cashflow-dash');
    if (!canvasDash) return;
    const aggDash = aggregateByRange(dashCashflowRange);
    let limit = dashCashflowRange === 'quarterly' ? 4 : (dashCashflowRange === 'yearly' ? 5 : 6);
    drawBarChart(canvasDash, { 
      labels: aggDash.labels.slice(-limit), 
      groups: [
        { data: aggDash.income.slice(-limit), color: THEME.primary }, 
        { data: aggDash.expense.slice(-limit), color: '#d6d9e0' }
      ] 
    });
  }

  function bindDashCashflowChips() {
    const chips = document.querySelectorAll('#dash-cf-period .chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => { c.classList.remove('is-active'); c.removeAttribute('aria-selected'); });
        chip.classList.add('is-active'); chip.setAttribute('aria-selected', 'true');
        dashCashflowRange = chip.dataset.range;
        renderDashCashflow();
      });
    });
  }


  // 8. RENDERIZAÇÃO: FLUXO DE CAIXA (fluxodecaixa.html)
  function renderCashflow() {
    const agg = aggregateByRange(CF.range);
    
    const canvas = document.getElementById('chart-cashflow-main');
    if (canvas) {
      const hasData = agg.income.some(v => v > 0) || agg.expense.some(v => v > 0);
      document.getElementById('chart-empty') && (document.getElementById('chart-empty').hidden = hasData);
      canvas.style.opacity = hasData ? '1' : '0.15';
      if(hasData) {
        drawBarChart(canvas, { labels: agg.labels, groups: [ { data: agg.income, color: THEME.primary }, { data: agg.expense, color: '#d6d9e0' } ] });
      } else {
        setupCanvas(canvas); 
      }
    }

    const totalIncome  = agg.income.reduce((a, b) => a + b, 0);
    const totalExpense = agg.expense.reduce((a, b) => a + b, 0);
    const balance = totalIncome - totalExpense;
    
    const $ = (id) => document.getElementById(id);
    if ($('kpi-income'))  $('kpi-income').textContent  = fmtBRL(totalIncome);
    if ($('kpi-expense')) $('kpi-expense').textContent = fmtBRL(totalExpense);
    if ($('kpi-balance')) $('kpi-balance').textContent = fmtBRL(balance);
    
    const trend = $('kpi-balance-trend');
    if (trend) {
      const margin = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
      trend.className = `trend ${margin >= 0 ? 'trend--up' : 'trend--down'}`;
      trend.textContent = `${margin >= 0 ? '+' : ''}${margin.toFixed(2).replace('.', ',')}%`;
    }

    const all = [...CF.transactions].sort((a, b) => (a.date < b.date ? 1 : -1));
    const incs = all.filter(t => t.type === 'income');
    const exps = all.filter(t => t.type === 'expense');
    
    renderTxList('income-list', incs, 'income');
    renderTxList('expense-list', exps, 'expense');
    
    if ($('income-total')) $('income-total').textContent = `+ ${fmtBRL(incs.reduce((a, b) => a + b.amount, 0))}`;
    if ($('expense-total')) $('expense-total').textContent = `- ${fmtBRL(exps.reduce((a, b) => a + b.amount, 0))}`;
    if ($('income-month-label')) $('income-month-label').textContent = `${incs.length} lançamento(s)`;
    if ($('expense-month-label')) $('expense-month-label').textContent = `${exps.length} lançamento(s)`;
  }

  function renderTxList(listId, items, type) {
    const list = document.getElementById(listId);
    if (!list) return;
    if (!items.length) { list.innerHTML = '<li class="tx-empty">Nenhum lançamento cadastrado.</li>'; return; }
    
    list.innerHTML = items.map((tx) => {
      const icon = TX_ICONS[tx.icon] || TX_ICONS.wallet;
      return `
        <li class="tx-row" data-id="${tx.id}">
          <span class="tx-row__icon tx-row__icon--${type}" aria-hidden="true">${icon}</span>
          <div class="tx-row__info">
            <span class="tx-row__name">${escapeHtml(tx.desc)}</span>
            <span class="tx-row__meta"><span>${escapeHtml(tx.category || '—')}</span><span class="tx-row__meta-sep">•</span><span>${formatDateBR(tx.date)}</span></span>
          </div>
          <span class="tx-row__amount tx-row__amount--${type}">${type==='income'?'+':'-'} ${fmtBRL(tx.amount)}</span>
          <button class="tx-row__remove" type="button" data-action="remove" data-id="${tx.id}" aria-label="Remover">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </li>`;
    }).join('');
  }

  function bindCashflowForm() {
    const form = document.getElementById('tx-form');
    if (!form) return;
    
    const dateInput = document.getElementById('tx-date');
    if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().slice(0, 10);
    
    const feedback = document.getElementById('tx-feedback');
    let fbTimer;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const type   = (form.querySelector('input[name="tx-type"]:checked') || {}).value || 'income';
      const desc   = document.getElementById('tx-desc').value.trim();
      const cat    = document.getElementById('tx-cat').value.trim();
      const date   = document.getElementById('tx-date').value;
      const amount = parseFloat(document.getElementById('tx-amount').value.replace(',','.'));
      
      if (!desc || !date) return showFeedback('Preencha descrição e data.', 'error');
      if (isNaN(amount) || amount <= 0) return showFeedback('Informe um valor válido.', 'error');
      
      CF.add({ id: cryptoId(), type, desc, category: cat || (type === 'income' ? 'Outras receitas' : 'Outras despesas'), date, amount, icon: pickIcon(desc, cat) });
      renderCashflow();
      
      document.getElementById('tx-desc').value = ''; 
      document.getElementById('tx-cat').value = ''; 
      document.getElementById('tx-amount').value = ''; 
      document.getElementById('tx-desc').focus();
      showFeedback(`Lançamento adicionado com sucesso!`, 'success');
    });

    function showFeedback(msg, kind) {
      if (!feedback) return;
      feedback.textContent = msg; feedback.className = `form-feedback is-${kind}`;
      clearTimeout(fbTimer); fbTimer = setTimeout(() => { feedback.textContent = ''; feedback.className = 'form-feedback'; }, 3500);
    }
  }


  // 9. RENDERIZAÇÃO: RENDA FIXA (rendafixa.html)
  function renderRendaFixa() {
    const tbody = document.getElementById('rf-list');
    if (!tbody) return;
    
    if (!RF.investments.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">Nenhum ativo de Renda Fixa cadastrado.</td></tr>';
    } else {
      tbody.innerHTML = [...RF.investments].sort((a,b) => a.date>b.date?1:-1).map(inv => {
        let color = 'color: var(--text-muted); background: var(--surface-2);';
        let sigla = inv.type.slice(0,3).toUpperCase();
        if(inv.type.toUpperCase().includes('CDB')) color = 'color: var(--primary); background: var(--primary-soft);';
        if(inv.type.toUpperCase().includes('LC')) color = 'color: #d97706; background: var(--accent-soft);';
        if(inv.type.toUpperCase().includes('TESOURO')) { color = 'color: #4f46e5; background: #e0e7ff;'; sigla = 'TES'; }
        
        return `<tr data-id="${inv.id}">
          <td><div class="asset"><span class="asset__mark" style="${color}">${sigla}</span><div><div class="asset__name">${escapeHtml(inv.type)}</div><div class="asset__sub">${escapeHtml(inv.inst)}</div></div></div></td>
          <td>Pós-fixado</td>
          <td class="num">${escapeHtml(inv.rate)}</td>
          <td class="num">${formatDateBR(inv.date)}</td>
          <td class="num">${fmtBRL(inv.amount)}</td>
          <td class="num hide-sm" style="font-weight:600">${fmtBRL(inv.amount*1.01)}</td>
          <td style="text-align: right;"><button type="button" data-action="remove-rf" data-id="${inv.id}" style="background:transparent;border:none;cursor:pointer;color:var(--text-subtle);"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></td>
        </tr>`;
      }).join('');
    }

    const total = RF.investments.reduce((s, i) => s + i.amount, 0);
    const $ = (id) => document.getElementById(id);
    if ($('rf-total-invested')) $('rf-total-invested').textContent = fmtBRL(total);
    if ($('rf-count')) $('rf-count').textContent = `em ${RF.investments.length} ativo(s)`;
    if ($('rf-rendimento-simulado')) $('rf-rendimento-simulado').textContent = `+ ${fmtBRL(total * 0.01)}`;

    const nextDateEl = $('rf-next-date');
    if (nextDateEl) {
      const today = new Date(); today.setHours(0,0,0,0);
      const futures = RF.investments.map(i => ({...i, dObj: parseDate(i.date)})).filter(i => i.dObj >= today).sort((a,b) => a.dObj - b.dObj);
      if (futures.length > 0) {
        const next = futures[0];
        nextDateEl.textContent = formatDateBR(next.date);
        $('rf-next-sub').textContent = `${next.type} ${next.inst}`;
        const days = Math.ceil(Math.abs(next.dObj - today) / (1000*60*60*24));
        $('rf-next-days').textContent = `Faltam ${days} dia(s)`;
        $('rf-next-days').style.color = days < 30 ? 'var(--danger)' : '#d97706';
      } else {
        nextDateEl.textContent = '--/--/----';
        $('rf-next-sub').textContent = 'Sem vencimentos';
        $('rf-next-days').textContent = '-';
      }
    }
  }

  function bindRFForm() {
    const form = document.getElementById('rf-form');
    if (!form) return;
    
    const dateInput = document.getElementById('rf-date');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

    const fb = document.getElementById('rf-feedback');
    let fbTimer;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('rf-type').value.trim();
      const inst = document.getElementById('rf-inst').value.trim();
      const rate = document.getElementById('rf-rate').value.trim();
      const date = document.getElementById('rf-date').value;
      const amount = parseFloat(document.getElementById('rf-amount').value.replace(',','.'));

      if (!type || !inst || !rate || !date) return showFeedback('Preencha todos os campos.', 'error');
      if (isNaN(amount) || amount <= 0) return showFeedback('Valor inválido.', 'error');
      if (date < new Date().toISOString().split('T')[0]) return showFeedback('Data no passado.', 'error');

      RF.add({ id: cryptoId(), type, inst, amount, rate, date });
      renderRendaFixa();
      form.reset(); document.getElementById('rf-type').focus();
      showFeedback('Ativo adicionado com sucesso!', 'success');
    });

    function showFeedback(msg, kind) {
      if(!fb) return;
      fb.textContent = msg; fb.className = `form-feedback is-${kind}`;
      clearTimeout(fbTimer); fbTimer = setTimeout(() => { fb.textContent = ''; fb.className = 'form-feedback'; }, 3500);
    }
  }


  // 10. BOOTSTRAP (Inicialização)
  document.addEventListener('DOMContentLoaded', () => {
    const isCashflow = window.location.pathname.includes('fluxodecaixa') || !!document.getElementById('chart-cashflow-main');
    const isRendaFixa = window.location.pathname.includes('rendafixa') || !!document.getElementById('rf-form');

    if (isCashflow) {
      CF.load(); 
      bindCashflowForm();
      renderCashflow();
      
      document.querySelectorAll('#cf-period .chip').forEach((chip) => {
        chip.addEventListener('click', (e) => {
          document.querySelectorAll('#cf-period .chip').forEach(c => c.classList.remove('is-active'));
          e.target.classList.add('is-active');
          CF.setRange(e.target.dataset.range || 'monthly');
          renderCashflow();
        });
      });

      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="remove"]');
        if (btn) { CF.remove(btn.dataset.id); renderCashflow(); }
      });

    } else if (isRendaFixa) {
      RF.load(); 
      bindRFForm(); 
      renderRendaFixa();
      
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="remove-rf"]');
        if (btn) { RF.remove(btn.dataset.id); renderRendaFixa(); }
      });

    } else {
      bindDashCashflowChips();
      renderAll();
    }

    const configBtn = document.querySelector('.sidebar__footer .nav__item');
    if (configBtn) {
      configBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm("ATENÇÃO: Isso vai apagar TODOS os seus dados salvos. Tem certeza?")) { 
          localStorage.clear(); 
          window.location.reload(); 
        }
      });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if(isCashflow) renderCashflow();
        else if(!isRendaFixa) renderAll();
      }, 120);
    });

    const updateTime = () => { const el = document.getElementById('last-update'); if (el) el.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };
    updateTime(); setInterval(updateTime, 60000);
  });

})();