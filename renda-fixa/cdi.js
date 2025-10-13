// ADIÇÃO: Variável global para armazenar a instância do gráfico
let investmentChart = null;

function calculateInvestment() {
    // 1. Obter os valores dos inputs
    const initialInvestment = parseFloat(document.getElementById('initial-investment').value);
    const investmentTimeMonths = parseInt(document.getElementById('investment-time').value);
    const annualCdiRate = parseFloat(document.getElementById('cdi-rate').value);
    const investmentPercentage = parseFloat(document.getElementById('investment-percentage').value);

    // Validação básica
    if (isNaN(initialInvestment) || isNaN(investmentTimeMonths) || isNaN(annualCdiRate) || isNaN(investmentPercentage)) {
        alert("Por favor, preencha todos os campos com valores numéricos.");
        return;
    }

    // 2. Preparar as variáveis para o cálculo
    const investmentDays = investmentTimeMonths * 30;
    const businessDays = Math.floor(investmentDays * (252 / 365)); 
    const dailyCdiRate = Math.pow((1 + (annualCdiRate / 100)), (1 / 252)) - 1;
    const effectiveDailyRate = dailyCdiRate * (investmentPercentage / 100);

    // 3. Calcular o valor bruto final
    const grossAmount = initialInvestment * Math.pow((1 + effectiveDailyRate), businessDays);
    const grossReturn = grossAmount - initialInvestment;

    // 4. Calcular o Imposto de Renda
    let irRate;
    if (investmentDays <= 180) { irRate = 0.225; }
    else if (investmentDays <= 360) { irRate = 0.20; }
    else if (investmentDays <= 720) { irRate = 0.175; }
    else { irRate = 0.15; }
    const irTax = grossReturn * irRate;

    // 5. Calcular o valor líquido final
    const netAmount = grossAmount - irTax;

    // 6. Exibir os resultados de texto
    document.getElementById('gross-amount').textContent = formatCurrency(grossAmount);
    document.getElementById('gross-return').textContent = formatCurrency(grossReturn);
    document.getElementById('ir-tax').textContent = `- ${formatCurrency(irTax)}`;
    document.getElementById('net-amount').textContent = formatCurrency(netAmount);
    document.getElementById('result-container').classList.remove('hidden');

    // --- ADIÇÃO: Lógica para gerar dados e renderizar o gráfico ---
    generateChartData(initialInvestment, investmentTimeMonths, effectiveDailyRate, irRate);
}

// ADIÇÃO: Função para gerar os dados para o gráfico
function generateChartData(initialValue, months, dailyRate, finalIrRate) {
    const labels = [];
    const dataPoints = [];

    for (let i = 0; i <= months; i++) {
        labels.push(`Mês ${i}`);
        
        const currentBusinessDays = Math.floor((i * 30) * (252 / 365));
        const currentGrossAmount = initialValue * Math.pow((1 + dailyRate), currentBusinessDays);
        const currentGrossReturn = currentGrossAmount - initialValue;
        
        // Aplica a alíquota final do IR sobre o rendimento do período atual
        const currentIrTax = currentGrossReturn * finalIrRate;
        const currentNetAmount = currentGrossAmount - currentIrTax;
        
        dataPoints.push(currentNetAmount.toFixed(2));
    }
    
    renderChart(labels, dataPoints);
}

// ADIÇÃO: Função para renderizar o gráfico
function renderChart(labels, data) {
    // Mostra o container do gráfico
    document.getElementById('chart-container').classList.remove('hidden');
    
    const ctx = document.getElementById('investmentChart').getContext('2d');

    // Se um gráfico já existe, ele é destruído para criar um novo
    if (investmentChart) {
        investmentChart.destroy();
    }

    investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor Líquido do Investimento (R$)',
                data: data,
                borderColor: '#00aaff',
                backgroundColor: 'rgba(0, 170, 255, 0.1)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#C5C6C7' }
                },
                title: {
                    display: true,
                    text: 'Evolução do Investimento ao Longo do Tempo',
                    color: '#FFFFFF',
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    ticks: { 
                        color: '#C5C6C7',
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    },
                    grid: { color: 'rgba(197, 198, 199, 0.2)' }
                },
                x: {
                    ticks: { color: '#C5C6C7' },
                    grid: { color: 'rgba(197, 198, 199, 0.2)' }
                }
            }
        }
    });
}

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}