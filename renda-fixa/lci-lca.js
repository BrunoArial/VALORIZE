const offers = [];
const tbody = document.querySelector('#offers-table tbody');
const summary = document.getElementById('summary');

function parseNumber(v) {
  const n = Number(String(v).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function calcFinal(principal, annualRatePct, months) {
  const annual = parseNumber(annualRatePct) / 100;
  const monthly = annual / 12;
  return principal * Math.pow(1 + monthly, months);
}

function addOffer(o) {
  offers.push(o);
  render();
}

function removeOffer(i) {
  offers.splice(i, 1);
  render();
}

function render() {
  tbody.innerHTML = '';

  if (offers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8">Nenhuma oferta adicionada.</td></tr>';
    summary.textContent = '';
    return;
  }

  offers.forEach((o, idx) => {
    const tr = document.createElement('tr');
    const final = calcFinal(o.principal, o.annualRatePct, o.months);
    const retornoPct = (final / o.principal - 1) * 100;

    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${o.bank}</td>
      <td>${o.kind}</td>
      <td>${o.remunLabel}</td>
      <td>${o.months}</td>
      <td>R$ ${final.toFixed(2)}</td>
      <td>${retornoPct.toFixed(2)}%</td>
      <td><button data-idx="${idx}" class="del">Remover</button></td>
    `;
    tr.dataset.final = final;
    tbody.appendChild(tr);
  });

  const rows = Array.from(tbody.querySelectorAll('tr'));
  let bestVal = -Infinity, bestIdx = -1;
  rows.forEach((r, i) => {
    const val = Number(r.dataset.final);
    if (val > bestVal) { bestVal = val; bestIdx = i; }
  });
  rows.forEach((r, i) => r.classList.toggle('best', i === bestIdx));

  const best = bestVal.toFixed(2);
  summary.textContent = `Melhor valor final: R$ ${best}`;

  tbody.querySelectorAll('.del').forEach(btn => {
    btn.addEventListener('click', () => removeOffer(Number(btn.dataset.idx)));
  });
}

document.getElementById('add-btn').addEventListener('click', () => {
  const bank = document.getElementById('bank').value.trim() || '—';
  const kind = document.getElementById('kind').value;
  const rateRaw = document.getElementById('rate').value.trim();
  const rateType = document.getElementById('rate-type').value;
  const months = parseNumber(document.getElementById('months').value);
  const principal = parseNumber(document.getElementById('principal').value);
  const cdi = parseNumber(document.getElementById('cdi').value);

  if (!rateRaw) {
    alert('Informe uma taxa válida.');
    return;
  }

  let annualRatePct = 0, remunLabel = '';
  if (rateType === 'fixed') {
    annualRatePct = parseNumber(rateRaw);
    remunLabel = annualRatePct + '% a.a. (fixa)';
  } else {
    const pctOfCdi = parseNumber(rateRaw);
    annualRatePct = pctOfCdi / 100 * cdi;
    remunLabel = pctOfCdi + '% do CDI (' + cdi + '% a.a.)';
  }

  addOffer({ bank, kind, annualRatePct, remunLabel, months, principal });
  document.getElementById('bank').value = '';
  document.getElementById('rate').value = '';
});

document.getElementById('clear-btn').addEventListener('click', () => {
  if (confirm('Deseja limpar todas as ofertas?')) {
    offers.length = 0;
    render();
  }
});

document.getElementById('sort-value').addEventListener('click', () => {
  offers.sort((a, b) =>
    calcFinal(b.principal, b.annualRatePct, b.months) -
    calcFinal(a.principal, a.annualRatePct, a.months)
  );
  render();
});

document.getElementById('export-csv').addEventListener('click', () => {
  if (offers.length === 0) {
    alert('Nenhuma oferta para exportar.');
    return;
  }

  const header = ['Banco', 'Tipo', 'Remuneração', 'Prazo(m)', 'Principal', 'ValorFinal', 'Retorno(%)'];
  const lines = [header.join(',')];
  offers.forEach(o => {
    const final = calcFinal(o.principal, o.annualRatePct, o.months);
    const retorno = ((final / o.principal) - 1) * 100;
    lines.push([`"${o.bank}"`, o.kind, `"${o.remunLabel}"`, o.months, o.principal.toFixed(2), final.toFixed(2), retorno.toFixed(2)].join(','));
  });

  const blob = new Blob([lines.join('\\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ofertas_lci_lca.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

render();
