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
                                        font: { family: "'Inter', sans-serif", size: 14 }
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

                const initialValue = parseFloat(document.getElementById('initial-value').value);
                const monthlyDeposit = parseFloat(document.getElementById('monthly-deposit').value);
                const months = parseInt(document.getElementById('months').value);
                const rate = parseFloat(document.getElementById('rate').value) / 100;
                const cdi = parseFloat(document.getElementById('cdi').value) / 100;

                if (isNaN(initialValue) || isNaN(monthlyDeposit) || isNaN(months) || isNaN(rate) || isNaN(cdi)) {
                    alert('Por favor, preencha todos os campos com valores válidos.');
                    return;
                }

                const effectiveAnnualRate = cdi * rate;
                const effectiveMonthlyRate = Math.pow(1 + effectiveAnnualRate, 1 / 12) - 1;

                let grossValue = initialValue;
                for (let i = 0; i < months; i++) {
                    grossValue *= (1 + effectiveMonthlyRate);
                    grossValue += monthlyDeposit; 
                }
                // Ajuste para o último aporte não render
                grossValue -= monthlyDeposit;
                let totalInvested = initialValue + (monthlyDeposit * months);
                // Se o aporte for no final do mês, o último não rende, então o valor bruto final não o inclui
                // mas para o total investido, ele conta. Então, vamos recalcular o valor bruto final corretamente.
                grossValue = initialValue * Math.pow(1 + effectiveMonthlyRate, months);
                if (monthlyDeposit > 0) {
                     grossValue += monthlyDeposit * ((Math.pow(1 + effectiveMonthlyRate, months) - 1) / effectiveMonthlyRate);
                }


                const grossInterest = grossValue - totalInvested;

                const days = months * 30;
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
                        <span>Total Investido (Aportes):</span>
                        <strong>${formatCurrency(totalInvested)}</strong>
                    </div>
                    <div class="resultado-item">
                        <span>Juros Brutos Acumulados:</span>
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
                        <span>Valor Líquido de Resgate:</span>
                        <strong>${formatCurrency(netValue)}</strong>
                    </div>
                `;
                
                createOrUpdateChart(totalInvested, netInterest);
            });
        });