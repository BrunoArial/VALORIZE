document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('controls-form');
    const kindSelect = document.getElementById('kind');
    const resultadoCard = document.getElementById('resultado-card');
    const resultadoDetalhes = document.getElementById('resultado-detalhes');
    let myChart = null;

    // Constante da Taxa B3
    const TAXA_B3_ANUAL = 0.0020; // 0.20%
    const fieldGroups = {
        selic: document.getElementById('fields-selic'),
        prefixado: document.getElementById('fields-prefixado'),
        ipca: document.getElementById('fields-ipca')
    };

    // --- LÓGICA PARA MOSTRAR/ESCONDER CAMPOS ---
    const updateVisibleFields = () => {
        const selectedKind = kindSelect.value;
        Object.values(fieldGroups).forEach(group => {
            if (group) group.style.display = 'none';
        });
        if (fieldGroups[selectedKind]) {
            fieldGroups[selectedKind].style.display = 'block';
        }
    };

    kindSelect.addEventListener('change', updateVisibleFields);
    updateVisibleFields();
    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const createOrUpdateChart = (totalInvested, netInterest) => {
        const ctx = document.getElementById('resultChart').getContext('2d');
        const chartData = {
            labels: ['Total Investido', 'Rendimento Líquido'],
            datasets: [{
                data: [totalInvested, netInterest],
                backgroundColor: [
                    getComputedStyle(document.documentElement).getPropertyValue('--cor-secundaria'),
                    getComputedStyle(document.documentElement).getPropertyValue('--cor-sucesso')
                ],
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-principal'),
                borderWidth: 4,
                hoverOffset: 4
            }]
        };

        if (myChart) {
            myChart.data = chartData;
            myChart.update();
        } else {
            myChart = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                font: {
                                    family: "'Inter', sans-serif",
                                    size: 14
                                }
                            },
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${formatCurrency(context.parsed)}`;
                                }
                            }
                        }
                    }
                }
            });
        }
    };
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Obter valores principais
        const principal = parseFloat(document.getElementById('principal').value);
        const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value) || 0;
        const years = parseFloat(document.getElementById('years').value);
        const kind = kindSelect.value;
        const nPeriods = years * 12;
        const days = years * 365;

        // 2. Obter valores das taxas
        const rates = {
            selic: parseFloat(document.getElementById('rate-selic').value) / 100,
            prefixado: parseFloat(document.getElementById('rate-prefixado').value) / 100,
            ipcaReal: parseFloat(document.getElementById('rate-ipca-real').value) / 100,
            ipcaEstimado: parseFloat(document.getElementById('rate-ipca-estimado').value) / 100
        };

        // 3. Validar valores
        let invalidInput = false;
        if (isNaN(principal) || isNaN(monthlyContribution) || isNaN(years) || principal < 0 || monthlyContribution < 0 || years <= 0) {
            invalidInput = true;
        }

        // 4. Calcular Taxa Efetiva Anual
        let effectiveAnnualRate;
        switch (kind) {
            case 'selic':
                if (isNaN(rates.selic)) invalidInput = true;
                effectiveAnnualRate = rates.selic;
                break;
            case 'prefixado':
                if (isNaN(rates.prefixado)) invalidInput = true;
                effectiveAnnualRate = rates.prefixado;
                break;
            case 'ipca':
                if (isNaN(rates.ipcaReal) || isNaN(rates.ipcaEstimado)) invalidInput = true;
                effectiveAnnualRate = (1 + rates.ipcaReal) * (1 + rates.ipcaEstimado) - 1;
                break;
        }

        if (invalidInput) {
            alert('Por favor, insira valores válidos para todos os campos.');
            return;
        }
        const monthlyRate = Math.pow(1 + effectiveAnnualRate, 1/12) - 1;

        // --- 5. CÁLCULO BRUTO (Fórmula de Valor Futuro - Unificada) ---
        let grossValue;
        let grossValue_Principal = principal * Math.pow(1 + monthlyRate, nPeriods);
        let grossValue_Monthly;
        if (monthlyRate === 0) {
            grossValue_Monthly = monthlyContribution * nPeriods;
        } else {
            grossValue_Monthly = monthlyContribution * ((Math.pow(1 + monthlyRate, nPeriods) - 1) / monthlyRate);
        }

        grossValue = grossValue_Principal + grossValue_Monthly;
        
        // --- 6. CÁLCULO DE TAXAS E IMPOSTOS ---

        const totalInvested = principal + (monthlyContribution * nPeriods);
        const grossInterest = grossValue - totalInvested;

        // b. Calcular Taxa B3
        let b3FeeTotal = 0;
        let valorMedio = (totalInvested + grossValue) / 2;
        
        if (kind === 'selic') {
            if (valorMedio > 10000) {
                b3FeeTotal = (valorMedio - 10000) * TAXA_B3_ANUAL * years;
            }
        } else {
            b3FeeTotal = valorMedio * TAXA_B3_ANUAL * years;
        }

        // c. Calcular Imposto de Renda
        let irRate;
        if (days <= 180) irRate = 0.225;
        else if (days <= 360) irRate = 0.20;
        else if (days <= 720) irRate = 0.175;
        else irRate = 0.15;


        const taxableInterest = grossInterest - b3FeeTotal;
        

        const irValue = (taxableInterest > 0) ? (taxableInterest * irRate) : 0;


        const netValue = grossValue - b3FeeTotal - irValue;
        const netInterest = netValue - totalInvested;

        // --- 7. Exibir resultados ---
        resultadoCard.style.display = 'block';
        resultadoDetalhes.innerHTML = `
            <div class="resultado-item">
                <span>Total Investido:</span>
                <strong>${formatCurrency(totalInvested)}</strong>
            </div>
            <div class="resultado-item">
                <span>Juros Brutos:</span>
                <strong>${formatCurrency(grossInterest)}</strong>
            </div>
            <div class="resultado-item">
                <span>Taxa B3 (aprox.):</span>
                <strong class="ir-value">- ${formatCurrency(b3FeeTotal)}</strong>
            </div>
            <div class="resultado-item">
                <span>Alíquota de IR (aprox.):</span>
                <strong>${(irRate * 100).toFixed(1)}%</strong>
            </div>
            <div class="resultado-item">
                <span>Imposto de Renda:</span>
                <strong class="ir-value">- ${formatCurrency(irValue)}</strong>
            </div>
            <div class="resultado-item total">
                <span>Valor Líquido Final:</span>
                <strong>${formatCurrency(netValue)}</strong>
            </div>
        `;

        createOrUpdateChart(totalInvested, netInterest);
    });
});