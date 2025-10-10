// Lógica para o cálculo do investimento e a geração do gráfico
document.getElementById('investment-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Mostra a seção de resultados que estava oculta
    const resultContainer = document.getElementById('result-container');
    resultContainer.classList.remove('hidden');

    // Aqui você adicionaria a lógica de cálculo real
    const initialAmount = parseFloat(document.getElementById('initial-amount').value);
    const years = parseInt(document.getElementById('investment-years').value);

    // Valores de exemplo
    const grossAmount = initialAmount * 1.5; 
    const ir = (grossAmount - initialAmount) * 0.15;
    const fee = initialAmount * 0.002 * years;
    const netAmount = grossAmount - ir - fee;
    
    // Função para formatar como moeda brasileira
    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };
    
    // Atualiza os campos de resultado na tela
    document.getElementById('result-initial').textContent = formatCurrency(initialAmount);
    document.getElementById('result-gross').textContent = formatCurrency(grossAmount);
    document.getElementById('result-gross-profit').textContent = formatCurrency(grossAmount - initialAmount);
    document.getElementById('result-ir').textContent = `- ${formatCurrency(ir)}`;
    document.getElementById('result-fee').textContent = `- ${formatCurrency(fee)}`;
    document.getElementById('result-net').textContent = formatCurrency(netAmount);

    // Lógica do Gráfico (usando Chart.js)
    const ctx = document.getElementById('result-chart').getContext('2d');
    
    // Destrói o gráfico anterior se existir, para poder criar um novo
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    const netProfit = netAmount - initialAmount;
    const taxesAndFees = ir + fee;
    
    window.myChart = new Chart(ctx, {
        type: 'pie', // Alterado para 'pie'
        data: {
            labels: ['Valor Inicial', 'Rendimento Líquido', 'Impostos e Taxas'],
            datasets: [{
                label: 'Composição do Valor Final',
                data: [initialAmount, netProfit, taxesAndFees],
                backgroundColor: [
                    '#1F2833', // Cor para Valor Inicial
                    '#45A29E', // Cor para Rendimento Líquido
                    '#C74242'  // Cor para Impostos e Taxas
                ],
                borderColor: '#0B0C10', // Cor da borda
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#C5C6C7',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
            // A propriedade 'scales' foi removida pois não se aplica a gráficos de pizza
        }
    });
});

