document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('simulation-form');

    form.addEventListener('submit', (event) => {
        event.preventDefault(); 
        const ticker = document.getElementById('ticker').value.trim().toUpperCase();
        const amount = parseFloat(document.getElementById('amount').value);
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (!validateInputs(ticker, amount, startDate, endDate)) {
            return; 
        }

        runSimulation(ticker, amount, startDate, endDate);
    });
});

function validateInputs(ticker, amount, startDate, endDate) {
    const tickerRegex = /^[A-Z]{4}[0-9]{1,2}$/;
    if (!ticker || !tickerRegex.test(ticker)) {
        showError("Por favor, insira um código de ativo válido (ex: PETR4, VALE3).");
        return false;
    }

    if (isNaN(amount) || amount <= 0) {
        showError("O valor do aporte deve ser um número positivo.");
        return false;
    }

    if (!startDate || !endDate) {
        showError("Por favor, selecione as datas de início e fim.");
        return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
        showError("A data de fim deve ser posterior à data de início.");
        return false;
    }
    
    document.getElementById('error-message').classList.add('hidden');
    return true; 
}

async function runSimulation(ticker, amount, startDate, endDate) {
    console.log("Iniciando simulação...");
    const resultsDashboard = document.getElementById('results-dashboard');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultsContent = document.getElementById('results-content');
    const errorMessageDiv = document.getElementById('error-message');

    resultsDashboard.classList.remove('hidden');
    loadingSpinner.classList.remove('hidden');
    resultsContent.classList.add('hidden');
    errorMessageDiv.classList.add('hidden');

    try {
        console.log("Buscando dados da API..."); 
        const historicalData = await fetchStockData(ticker, startDate, endDate);
        console.log("Dados recebidos da API:", historicalData);

        if (!historicalData || historicalData.length === 0) {
           throw new Error("Não foram encontrados dados históricos para o ativo no período selecionado. Verifique o ticker e as datas.");
        }

        console.log("Executando estratégia de investimento...");
        const simulationResult = executeDcaStrategy(historicalData, amount, startDate, endDate);

        console.log("Calculando métricas de desempenho..."); 
        const performanceMetrics = calculatePerformanceMetrics(simulationResult, startDate, endDate);

        console.log("Exibindo resultados...");
        displayResults(performanceMetrics, simulationResult.portfolioHistory);

        resultsContent.classList.remove('hidden');
    } catch (error) {
        console.error("Erro durante a simulação:", error);
        showError(error.message);
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function showError(message) {
     const resultsDashboard = document.getElementById('results-dashboard');
     const errorMessageDiv = document.getElementById('error-message');
     const resultsContent = document.getElementById('results-content');
     const loadingSpinner = document.getElementById('loading-spinner');
     
     resultsDashboard.classList.remove('hidden');
     resultsContent.classList.add('hidden');
     loadingSpinner.classList.add('hidden');

     errorMessageDiv.textContent = `Ocorreu um erro: ${message}`;
     errorMessageDiv.classList.remove('hidden');
}

async function fetchStockData(ticker, startDate, endDate) {
    const range = 'max'; 
    const interval = '1d'; 
    const url = `https://brapi.dev/api/quote/${ticker}?range=${range}&interval=${interval}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Falha na comunicação com a API (Status: ${response.status}). Tente novamente mais tarde.`);
    }

    const data = await response.json();
    console.log("Dados brutos da API:", data); 

    if (data.error) {
        throw new Error(`A API retornou um erro: ${data.error}`);
    }

    if (!data.results || !data.results[0] || !data.results[0].historicalDataPrice) {
        throw new Error('O ativo solicitado não foi encontrado ou a resposta da API está em um formato inesperado.');
    }

    const userStartDate = new Date(startDate);
    const userEndDate = new Date(endDate);

    const historicalData = data.results[0].historicalDataPrice.filter(item => {
        const itemDate = new Date(item.date * 1000); 
        return itemDate >= userStartDate && itemDate <= userEndDate;
    });

    historicalData.sort((a, b) => a.date - b.date);

    return historicalData;
}

function executeDcaStrategy(historicalData, monthlyAmount, startDateStr, endDateStr) {
    let totalInvested = 0;
    let sharesOwned = 0;
    const portfolioHistory = []; 

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    let investmentDates = [];
    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (currentDate <= endDate) {
        investmentDates.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    let nextInvestmentDateIndex = 0;

    for (const day of historicalData) {
        const currentTradingDate = new Date(day.date * 1000);
        
        if (nextInvestmentDateIndex < investmentDates.length && currentTradingDate >= investmentDates[nextInvestmentDateIndex]) {
            const purchasePrice = day.close;
            if (purchasePrice > 0) {
                totalInvested += monthlyAmount;
                const sharesPurchased = monthlyAmount / purchasePrice;
                sharesOwned += sharesPurchased;
            }
            nextInvestmentDateIndex++;
        }

        const portfolioValue = sharesOwned * day.close;
        portfolioHistory.push({
            x: currentTradingDate,
            y: portfolioValue
        });
    }

    const lastPrice = historicalData.length > 0 ? historicalData[historicalData.length - 1].close : 0;
    const finalPortfolioValue = sharesOwned * lastPrice;

    return { totalInvested, finalPortfolioValue, sharesOwned, portfolioHistory };
}

function calculatePerformanceMetrics(simulationResult, startDate, endDate) {
    const { totalInvested, finalPortfolioValue } = simulationResult;
    
    const totalReturn = calculateROI(finalPortfolioValue, totalInvested);
    const annualizedReturn = calculateCAGR(finalPortfolioValue, totalInvested, startDate, endDate);

    return { totalInvested, finalPortfolioValue, totalReturn, annualizedReturn };
}

function calculateROI(finalValue, totalInvested) {
    if (totalInvested === 0) return 0;
    return ((finalValue - totalInvested) / totalInvested) * 100;
}

function calculateCAGR(finalValue, totalInvested, startDateStr, endDateStr) {
    if (totalInvested <= 0) return 0;

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    if (years < 1) return calculateROI(finalValue, totalInvested);
    
    const cagr = (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100;
    return cagr;
}

function displayResults(metrics, portfolioHistory) {
    const container = document.getElementById('summary-table-container');
    container.innerHTML = ''; 

    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const table = document.createElement('table');
    table.innerHTML = `
        <tbody>
            <tr>
                <td>Período da Simulação</td>
                <td>${new Date(document.getElementById('start-date').value.replace(/-/g, '\/')).toLocaleDateString('pt-BR')} a ${new Date(document.getElementById('end-date').value.replace(/-/g, '\/')).toLocaleDateString('pt-BR')}</td>
            </tr>
            <tr>
                <td>Valor Total Investido</td>
                <td>${formatCurrency(metrics.totalInvested)}</td>
            </tr>
            <tr>
                <td>Valor Final do Portfólio</td>
                <td>${formatCurrency(metrics.finalPortfolioValue)}</td>
            </tr>
            <tr>
                <td>Retorno Total (ROI)</td>
                <td>${metrics.totalReturn.toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Retorno Anualizado (CAGR)</td>
                <td>${metrics.annualizedReturn.toFixed(2)}%</td>
            </tr>
        </tbody>
    `;
    container.appendChild(table);

    renderPortfolioChart(portfolioHistory);
}

let portfolioChartInstance = null;

function renderPortfolioChart(portfolioHistory) {
    const ctx = document.getElementById('portfolio-chart').getContext('2d');

    if (portfolioChartInstance) {
        portfolioChartInstance.destroy();
    }

    portfolioChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Valor do Portfólio',
                data: portfolioHistory,
                borderColor: 'rgba(255, 255, 255, 1)',
                backgroundColor: 'rgba(0, 82, 204, 0.1)',
                borderWidth: 2,
                pointRadius: 0, 
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year',
                        tooltipFormat: 'dd/MM/yyyy',
                        displayFormats: {
                            year: 'yyyy'
                        }
                    },
                    title: { display: true, text: 'Data' }
                },
                y: {
                    title: { display: true, text: 'Valor do Portfólio (R$)' },
                    ticks: {
                        callback: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (context) => `Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y)}`
                    }
                },
                 legend: {
                    display: false 
                }
            }
        }
    });
}