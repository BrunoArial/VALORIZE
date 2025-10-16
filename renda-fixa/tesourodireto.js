
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.getElementById('controls-form');
            const resultadoCard = document.getElementById('resultado-card');
            const resultadoDetalhes = document.getElementById('resultado-detalhes');
            let myChart = null;

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
                                    }
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

                const principal = parseFloat(document.getElementById('principal').value);
                const years = parseFloat(document.getElementById('years').value);
                const kind = document.getElementById('kind').value;

                if (isNaN(principal) || isNaN(years) || principal <= 0 || years <= 0) {
                    alert('Por favor, insira valores válidos.');
                    return;
                }

                // Definir taxas de exemplo
                const TAXA_SELIC_ANUAL = 0.1050; // 10.50%
                const TAXA_PREFIXADA_ANUAL = 0.11; // 11%
                const TAXA_IPCA_ANUAL = 0.055; // 5.5%
                const IPCA_ESTIMADO_ANUAL = 0.04; // 4%

                let effectiveRate;
                switch (kind) {
                    case 'selic':
                        effectiveRate = TAXA_SELIC_ANUAL;
                        break;
                    case 'prefixado':
                        effectiveRate = TAXA_PREFIXADA_ANUAL;
                        break;
                    case 'ipca':
                        effectiveRate = (1 + TAXA_IPCA_ANUAL) * (1 + IPCA_ESTIMADO_ANUAL) - 1;
                        break;
                }

                const grossValue = principal * Math.pow(1 + effectiveRate, years);
                const grossInterest = grossValue - principal;

                // Calcular Imposto de Renda
                const days = years * 365;
                let irRate;
                if (days <= 180) irRate = 0.225;
                else if (days <= 360) irRate = 0.20;
                else if (days <= 720) irRate = 0.175;
                else irRate = 0.15;

                const irValue = grossInterest * irRate;
                const netValue = grossValue - irValue;
                const netInterest = grossInterest - irValue;

                resultadoCard.style.display = 'block';
                resultadoDetalhes.innerHTML = `
                    <div class="resultado-item">
                        <span>Total Investido:</span>
                        <strong>${formatCurrency(principal)}</strong>
                    </div>
                    <div class="resultado-item">
                        <span>Juros Brutos:</span>
                        <strong>${formatCurrency(grossInterest)}</strong>
                    </div>
                    <div class="resultado-item">
                        <span>Alíquota de IR:</span>
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
                
                createOrUpdateChart(principal, netInterest);
            });
        });