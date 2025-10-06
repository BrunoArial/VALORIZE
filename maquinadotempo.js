document.addEventListener('DOMContentLoaded', () => {
    
    const config = {
        api: {
            baseUrl: 'https://brapi.dev/api/quote/{ticker}?range=max&interval=1d',
        },
        elements: {
            form: 'simulation-form',
            ticker: 'ticker',
            amount: 'amount',
            startDate: 'start-date',
            endDate: 'end-date',
            resultsDashboard: 'results-dashboard',
            loadingSpinner: 'loading-spinner',
            resultsContent: 'results-content',
            errorMessage: 'error-message',
            summaryTableContainer: 'summary-table-container',
            portfolioChart: 'portfolio-chart',
        },
        validation: {
            tickerRegex: /^[A-Z]{4}[0-9]{1,2}$/,
        },
        chart: {
            instance: null,
            colors: ['#0052CC', '#FF5630', '#36B37E', '#FFAB00', '#6554C0', '#00B8D9', '#FF8B00'],
        },
    };

    const ui = {
        elements: {
            form: document.getElementById(config.elements.form), 
            ticker: document.getElementById(config.elements.ticker),
            amount: document.getElementById(config.elements.amount),
            startDate: document.getElementById(config.elements.startDate),
            endDate: document.getElementById(config.elements.endDate),
            resultsDashboard: document.getElementById(config.elements.resultsDashboard),
            loadingSpinner: document.getElementById(config.elements.loadingSpinner),
            resultsContent: document.getElementById(config.elements.resultsContent),
            errorMessage: document.getElementById(config.elements.errorMessage),
            summaryTableContainer: document.getElementById(config.elements.summaryTableContainer),
            portfolioChart: document.getElementById(config.elements.portfolioChart),
        },

        getFormInput() {
            const tickers = this.elements.ticker.value
                .split(',')
                .map(t => t.trim().toUpperCase())
                .filter(t => t); 
            return {
                tickers,
                amount: parseFloat(this.elements.amount.value),
                startDate: this.elements.startDate.value,
                endDate: this.elements.endDate.value,
            };
        },

        formatCurrency(value) {
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        },
        
        renderState(state, message = '') {
            this.elements.resultsDashboard.classList.toggle('hidden', state === 'initial');
            this.elements.loadingSpinner.classList.toggle('hidden', state !== 'loading');
            this.elements.resultsContent.classList.toggle('hidden', state !== 'results');
            this.elements.errorMessage.classList.toggle('hidden', state !== 'error');

            if (state === 'error') {
                this.elements.errorMessage.textContent = `Ocorreu um erro: ${message}`;
            }
        },
        
        renderSummaryTable(allResults, input) {
            const { total, individual } = allResults;

            const createRow = (label, value) => `<tr><td>${label}</td><td>${value}</td></tr>`;

            const totalTable = `
                <h3 class="summary-title">Resumo do Portfólio Total</h3>
                <table>
                    <tbody>
                        ${createRow('Período da Simulação', `${new Date(input.startDate.replace(/-/g, '/')).toLocaleDateString('pt-BR')} a ${new Date(input.endDate.replace(/-/g, '/')).toLocaleDateString('pt-BR')}`)}
                        ${createRow('Valor Total Investido', this.formatCurrency(total.metrics.totalInvested))}
                        ${createRow('Valor Final do Portfólio', this.formatCurrency(total.metrics.finalPortfolioValue))}
                        ${createRow('Retorno Total (ROI)', `${total.metrics.totalReturn.toFixed(2)}%`)}
                        ${createRow('Retorno Anualizado (CAGR)', `${total.metrics.annualizedReturn.toFixed(2)}%`)}
                    </tbody>
                </table>
            `;

            const individualTables = individual.map(result => `
                <h4 class="summary-title-asset">${result.ticker}</h4>
                <table>
                    <tbody>
                        ${createRow('Total Investido no Ativo', this.formatCurrency(result.metrics.totalInvested))}
                        ${createRow('Valor Final do Ativo', this.formatCurrency(result.metrics.finalPortfolioValue))}
                        ${createRow('Retorno (ROI) do Ativo', `${result.metrics.totalReturn.toFixed(2)}%`)}
                    </tbody>
                </table>
            `).join('');

            this.elements.summaryTableContainer.innerHTML = totalTable + individualTables;
        },

        renderPortfolioChart(allResults) {
            const { total, individual } = allResults;
            const ctx = this.elements.portfolioChart.getContext('2d');

            if (config.chart.instance) {
                config.chart.instance.destroy();
            }
            
            const datasets = individual.map((result, index) => ({
                label: `Portfólio ${result.ticker}`,
                data: result.portfolioHistory,
                borderColor: config.chart.colors[index % config.chart.colors.length],
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
            }));

            datasets.unshift({
                label: 'Portfólio Total',
                data: total.portfolioHistory,
                borderColor: 'rgba(0, 0, 0, 1)',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderWidth: 3,
                pointRadius: 0,
                fill: true,
            });

            config.chart.instance = new Chart(ctx, {
                type: 'line',
                data: { datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { type: 'time', time: { unit: 'year', tooltipFormat: 'dd/MM/yyyy' }, title: { display: true, text: 'Data' } },
                        y: { title: { display: true, text: 'Valor do Portfólio (R$)' }, ticks: { callback: (value) => this.formatCurrency(value) } }
                    },
                    plugins: {
                        tooltip: { mode: 'index', intersect: false, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${this.formatCurrency(ctx.parsed.y)}` } },
                        legend: { display: true, position: 'top' }
                    }
                }
            });
        },
    };

    const api = {
        async fetchStockData(ticker) {
            const url = config.api.baseUrl.replace('{ticker}', ticker);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Falha na API para ${ticker} (Status: ${response.status}).`);
            }
            const data = await response.json();
            if (data.error || !data.results?.[0]?.historicalDataPrice) {
                throw new Error(data.error || `Ativo ${ticker} não encontrado ou resposta inválida.`);
            }
            return { ticker, data: data.results[0].historicalDataPrice.sort((a, b) => a.date - b.date) };
        }
    };

    const simulation = {
        validateInputs({ tickers, amount, startDate, endDate }) {
        if (tickers.length === 0) return "Por favor, insira pelo menos um código de ativo.";
        for (const ticker of tickers) {
            if (!config.validation.tickerRegex.test(ticker)) return `O código de ativo "${ticker}" é inválido (ex: PETR4, VALE3).`;
        }
        if (isNaN(amount) || amount <= 0) return "O valor do aporte deve ser um número positivo.";
        if (!startDate || !endDate) return "Por favor, selecione as datas de início e fim.";

        const userEndDate = new Date(endDate);
        const today = new Date();
        userEndDate.setUTCHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (userEndDate > today) return "A data de fim não pode ser no futuro. Por favor, selecione uma data até hoje.";
    
        if (new Date(endDate) <= new Date(startDate)) return "A data de fim deve ser posterior à data de início.";
        return null;
},

        executeDcaStrategy(historicalData, monthlyAmount, startDateStr, endDateStr) {
            let totalInvested = 0;
            let sharesOwned = 0;
            const portfolioHistory = [];
            const userStartDate = new Date(startDateStr);
            const userEndDate = new Date(endDateStr);
            
            const investmentMonths = new Set();
            let currentMonth = new Date(userStartDate.getFullYear(), userStartDate.getMonth());
            while(currentMonth <= userEndDate) {
                investmentMonths.add(`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`);
                currentMonth.setMonth(currentMonth.getMonth() + 1);
            }

            const processedMonths = new Set();
            const dataInPeriod = historicalData.filter(day => {
                const dayDate = new Date(day.date * 1000);
                return dayDate >= userStartDate && dayDate <= userEndDate;
            });
            
            if (dataInPeriod.length === 0) {
                 throw new Error("Não foram encontrados dados históricos para o ativo no período selecionado.");
            }
            
            for (const day of dataInPeriod) {
                const currentTradingDate = new Date(day.date * 1000);
                const monthKey = `${currentTradingDate.getFullYear()}-${currentTradingDate.getMonth()}`;

                if (investmentMonths.has(monthKey) && !processedMonths.has(monthKey)) {
                    if (day.close > 0) {
                        totalInvested += monthlyAmount;
                        sharesOwned += monthlyAmount / day.close;
                        processedMonths.add(monthKey);
                    }
                }
                portfolioHistory.push({ x: currentTradingDate, y: sharesOwned * day.close });
            }

            const finalPortfolioValue = sharesOwned * dataInPeriod[dataInPeriod.length - 1].close;
            return { totalInvested, finalPortfolioValue, portfolioHistory };
        },
        
        calculatePerformanceMetrics({ totalInvested, finalPortfolioValue }, startDate, endDate) {
            const calculateROI = (final, initial) => (initial === 0) ? 0 : ((final - initial) / initial) * 100;
            const calculateCAGR = (final, initial, start, end) => {
                if (initial <= 0) return 0;
                const years = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24 * 365.25);
                return years < 1 ? calculateROI(final, initial) : (Math.pow(final / initial, 1 / years) - 1) * 100;
            };

            return {
                totalInvested,
                finalPortfolioValue,
                totalReturn: calculateROI(finalPortfolioValue, totalInvested),
                annualizedReturn: calculateCAGR(finalPortfolioValue, totalInvested, startDate, endDate)
            };
        },

        aggregateResults(individualResults) {
            const total = {
                metrics: { totalInvested: 0, finalPortfolioValue: 0 },
                portfolioHistory: []
            };
            const historyMap = new Map();

            individualResults.forEach(result => {
                total.metrics.totalInvested += result.metrics.totalInvested;
                total.metrics.finalPortfolioValue += result.metrics.finalPortfolioValue;
                result.portfolioHistory.forEach(point => {
                    const timestamp = point.x.getTime();
                    historyMap.set(timestamp, (historyMap.get(timestamp) || 0) + point.y);
                });
            });

            total.portfolioHistory = Array.from(historyMap.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([timestamp, value]) => ({ x: new Date(timestamp), y: value }));
                
            return total;
        }
    };
    
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        
        const input = ui.getFormInput();
        const validationError = simulation.validateInputs(input);

        if (validationError) {
            ui.renderState('error', validationError);
            return;
        }

        ui.renderState('loading');
        const amountPerAsset = input.amount / input.tickers.length;

        try {
            const dataPromises = input.tickers.map(ticker => api.fetchStockData(ticker));
            const fetchedDataArray = await Promise.all(dataPromises);

            const individualResults = fetchedDataArray.map(({ ticker, data }) => {
                const simResult = simulation.executeDcaStrategy(data, amountPerAsset, input.startDate, input.endDate);
                const metrics = simulation.calculatePerformanceMetrics(simResult, input.startDate, input.endDate);
                return { ticker, metrics, portfolioHistory: simResult.portfolioHistory };
            });

            const totalResultData = simulation.aggregateResults(individualResults);
            const totalMetrics = simulation.calculatePerformanceMetrics(totalResultData.metrics, input.startDate, input.endDate);
            
            const allResults = {
                total: { metrics: totalMetrics, portfolioHistory: totalResultData.portfolioHistory },
                individual: individualResults
            };
            
            ui.renderSummaryTable(allResults, input);
            ui.renderPortfolioChart(allResults);
            
            ui.renderState('results');

        } catch (error) {
            console.error("Erro durante a simulação:", error);
            ui.renderState('error', error.message);
        }
    };

    ui.elements.form.addEventListener('submit', handleFormSubmit);
});