
document.getElementById('investment-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const resultContainer = document.getElementById('result-container');
    resultContainer.classList.remove('hidden');

    const initialAmount = parseFloat(document.getElementById('initial-amount').value);
    const years = parseInt(document.getElementById('investment-years').value);

    const grossAmount = initialAmount * 1.5; 
    const ir = (grossAmount - initialAmount) * 0.15;
    const fee = initialAmount * 0.002 * years;
    const netAmount = grossAmount - ir - fee;
    
    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };
    
    document.getElementById('result-initial').textContent = formatCurrency(initialAmount);
    document.getElementById('result-gross').textContent = formatCurrency(grossAmount);
    document.getElementById('result-gross-profit').textContent = formatCurrency(grossAmount - initialAmount);
    document.getElementById('result-ir').textContent = `- ${formatCurrency(ir)}`;
    document.getElementById('result-fee').textContent = `- ${formatCurrency(fee)}`;
    document.getElementById('result-net').textContent = formatCurrency(netAmount);

    const ctx = document.getElementById('result-chart').getContext('2d');
    
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    const netProfit = netAmount - initialAmount;
    const taxesAndFees = ir + fee;
    
    window.myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Valor Inicial', 'Rendimento Líquido', 'Impostos e Taxas'],
            datasets: [{
                label: 'Composição do Valor Final',
                data: [initialAmount, netProfit, taxesAndFees],
                backgroundColor: [
                    '#1F2833',
                    '#45A29E', 
                    '#C74242'  
                ],
                borderColor: '#0B0C10', 
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
        }
    });
});

