document.addEventListener('DOMContentLoaded', () => {
    const gradeNacional = document.getElementById('grade-nacional');
    const gradeGlobal = document.getElementById('grade-global');

    const nationalIndices = [
        { id: 'ibovespa', name: 'IBOVESPA', value: 121570.00, currency: 'PTS', chartData: Array.from({ length: 20 }, () => 121570.00 + Math.random() * 500 - 250) },
        { id: 'ibrx100', name: 'IBrX 100', value: 51430.00, currency: 'PTS', chartData: Array.from({ length: 20 }, () => 51430.00 + Math.random() * 200 - 100) },
        { id: 'smll', name: 'Small Caps (SMLL)', value: 2085.00, currency: 'PTS', chartData: Array.from({ length: 20 }, () => 2085.00 + Math.random() * 20 - 10) },
        { id: 'idiv', name: 'Dividendos (IDIV)', value: 8110.00, currency: 'PTS', chartData: Array.from({ length: 20 }, () => 8110.00 + Math.random() * 50 - 25) },
        { id: 'ifnc', name: 'Financeiro (IFNC)', value: 12350.00, currency: 'PTS', chartData: Array.from({ length: 20 }, () => 12350.00 + Math.random() * 100 - 50) },
        { id: 'ifix', name: 'Fundos Imob. (IFIX)', value: 3360.00, currency: 'PTS', chartData: Array.from({ length: 20 }, () => 3360.00 + Math.random() * 15 - 7.5) }
    ];

    const globalIndices = [
        { id: 'sp500', name: 'S&P 500', value: 5473.29, currency: 'USD', chartData: Array.from({ length: 20 }, () => 5473.29 + Math.random() * 20 - 10) },
        { id: 'nasdaq', name: 'NASDAQ', value: 17857.02, currency: 'USD', chartData: Array.from({ length: 20 }, () => 17857.02 + Math.random() * 50 - 25) },
        { id: 'dowjones', name: 'DOW JONES', value: 38747.11, currency: 'USD', chartData: Array.from({ length: 20 }, () => 38747.11 + Math.random() * 100 - 50) },
        { id: 'nikkei', name: 'NIKKEI 225', value: 38814.56, currency: 'JPY', chartData: Array.from({ length: 20 }, () => 38814.56 + Math.random() * 200 - 100) },
        { id: 'dax', name: 'DAX', value: 18495.00, currency: 'EUR', chartData: Array.from({ length: 20 }, () => 18495.00 + Math.random() * 100 - 50) },
        { id: 'ftse100', name: 'FTSE 100', value: 8247.00, currency: 'GBP', chartData: Array.from({ length: 20 }, () => 8247.00 + Math.random() * 40 - 20) }
    ];

    const charts = {};

    function renderGrid(container, indicesData) {
        container.innerHTML = '';
        indicesData.forEach(index => {
            const change = (Math.random() * 2 - 1);
            const changePercent = (change / index.value) * 100;
            const isPositive = change >= 0;
            
            const card = document.createElement('div');
            card.id = `card-${index.id}`;
            card.className = 'quote-card';

            card.innerHTML = `
                <div class="card-header">
                    <div>
                        <div class="index-name">${index.name}</div>
                        <div class="index-currency">${index.currency}</div>
                    </div>
                    <div id="change-${index.id}" class="index-change ${isPositive ? 'positive' : 'negative'}">
                        <div class="change-value">${isPositive ? '▲' : '▼'} ${change.toFixed(2)}</div>
                        <div>(${isPositive ? '+' : ''}${changePercent.toFixed(2)}%)</div>
                    </div>
                </div>
                <div id="value-${index.id}" class="index-value">
                    ${index.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div class="chart-container">
                    <canvas id="chart-${index.id}"></canvas>
                </div>
            `;
            container.appendChild(card);
            createChart(index);
        });
    }

    function createChart(index) {
        const ctx = document.getElementById(`chart-${index.id}`).getContext('2d');
        const isPositive = index.chartData[index.chartData.length - 1] > index.chartData[0];
        const color = isPositive ? '#16A34A' : '#DC2626';

        charts[index.id] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    data: index.chartData,
                    borderColor: color,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    }

    function updateQuotes(indicesData) {
        indicesData.forEach(index => {
            const fluctuation = index.value * 0.0005;
            const change = (Math.random() * fluctuation * 2) - fluctuation;
            index.value += change;
            
            const dailyChange = index.value - index.chartData[0];
            const dailyChangePercent = (dailyChange / index.chartData[0]) * 100;
            const isPositive = dailyChange >= 0;

            const valueEl = document.getElementById(`value-${index.id}`);
            if (valueEl) {
                valueEl.textContent = index.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            
            const changeEl = document.getElementById(`change-${index.id}`);
            if(changeEl) {
                changeEl.className = `index-change ${isPositive ? 'positive' : 'negative'}`;
                changeEl.innerHTML = `
                    <div class="change-value">${isPositive ? '▲' : '▼'} ${dailyChange.toFixed(2)}</div>
                    <div>(${isPositive ? '+' : ''}${dailyChangePercent.toFixed(2)}%)</div>
                `;
            }
            
            const chart = charts[index.id];
            if (chart) {
                const newData = chart.data.datasets[0].data;
                newData.push(index.value);
                newData.shift();
                
                const chartIsPositive = newData[newData.length - 1] > newData[0];
                chart.data.datasets[0].borderColor = chartIsPositive ? '#16A34A' : '#DC2626';
                chart.update('none');
            }
        });
    }

    renderGrid(gradeNacional, nationalIndices);
    renderGrid(gradeGlobal, globalIndices);

    setInterval(() => {
        updateQuotes(nationalIndices);
        updateQuotes(globalIndices);
    }, 2500);
});