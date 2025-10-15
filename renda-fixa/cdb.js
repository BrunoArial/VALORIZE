document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cdb-form');
    const resultadosPlaceholder = document.getElementById('resultados-placeholder');
    const resultadosConteudo = document.getElementById('resultados-conteudo');
    const valorBrutoFinalEl = document.getElementById('valor-bruto-final');
    const impostoRendaEl = document.getElementById('imposto-renda');
    const valorLiquidoFinalEl = document.getElementById('valor-liquido-final');
    const totalInvestidoEl = document.getElementById('total-investido');
    const jurosBrutosEl = document.getElementById('juros-brutos');
    const aliquotaIrEl = document.getElementById('aliquota-ir');

    let graficoCdb = null;

    const formatarMoeda = (valor) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const obterAliquotaIR = (prazoMeses) => {
        const dias = prazoMeses * 30;
        if (dias <= 180) return 0.225;
        if (dias <= 360) return 0.20;
        if (dias <= 720) return 0.175;
        return 0.15;
    };

    const simularInvestimento = (evento) => {
        evento.preventDefault();

        const valorInicial = parseFloat(document.getElementById('valor-inicial').value) || 0;
        const aporteMensal = parseFloat(document.getElementById('aporte-mensal').value) || 0;
        const prazoMeses = parseInt(document.getElementById('prazo-meses').value) || 0;
        const rentabilidadeCdb = parseFloat(document.getElementById('rentabilidade-cdb').value) || 0;
        const taxaDi = parseFloat(document.getElementById('taxa-di').value) || 0;

        if (prazoMeses <= 0 || rentabilidadeCdb <= 0 || taxaDi <= 0) {
            alert("Por favor, preencha o prazo, a rentabilidade e a taxa DI com valores válidos.");
            return;
        }

        const taxaDiaria = Math.pow(1 + (taxaDi / 100), 1 / 252) - 1;
        const taxaEfetivaDiaria = taxaDiaria * (rentabilidadeCdb / 100);

        let valorAcumulado = valorInicial;
        let totalAportado = valorInicial;

        const dadosGrafico = {
            labels: [],
            investido: [],
            juros: []
        };

        for (let mes = 1; mes <= prazoMeses; mes++) {
            if (mes > 1) {
                valorAcumulado += aporteMensal;
                totalAportado += aporteMensal;
            }
            const diasUteisMes = 21;
            valorAcumulado *= Math.pow(1 + taxaEfetivaDiaria, diasUteisMes);

            if (mes % 6 === 0 || mes === prazoMeses) {
                dadosGrafico.labels.push(`${mes}m`);
                dadosGrafico.investido.push(totalAportado);
                dadosGrafico.juros.push(valorAcumulado - totalAportado);
            }
        }

        const jurosBrutos = valorAcumulado - totalAportado;
        const aliquotaIr = obterAliquotaIR(prazoMeses);
        const impostoDevido = jurosBrutos * aliquotaIr;
        const valorLiquido = valorAcumulado - impostoDevido;

        resultadosPlaceholder.classList.add('hidden');
        resultadosConteudo.classList.remove('hidden');

        valorBrutoFinalEl.textContent = formatarMoeda(valorAcumulado);
        impostoRendaEl.textContent = `- ${formatarMoeda(impostoDevido)}`;
        valorLiquidoFinalEl.textContent = formatarMoeda(valorLiquido);
        totalInvestidoEl.textContent = formatarMoeda(totalAportado);
        jurosBrutosEl.textContent = formatarMoeda(jurosBrutos);
        aliquotaIrEl.textContent = `${(aliquotaIr * 100).toFixed(1)}%`;

        renderizarGrafico(dadosGrafico);
    };

    const renderizarGrafico = (dados) => {
        const ctx = document.getElementById('grafico-cdb').getContext('2d');
        if (graficoCdb) {
            graficoCdb.destroy();
        }
        graficoCdb = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dados.labels,
                datasets: [
                    {
                        label: 'Total Investido',
                        data: dados.investido,
                        backgroundColor: '#1E3A8A',
                    },
                    {
                        label: 'Juros',
                        data: dados.juros,
                        backgroundColor: '#16A34A',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${formatarMoeda(context.raw)}`
                        }
                    },
                    legend: {
                        labels: {
                            font: { family: "'Inter', sans-serif" }
                        }
                    }
                },
                scales: {
                    x: { 
                        stacked: true,
                        ticks: { font: { family: "'Inter', sans-serif" }}
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            font: { family: "'Inter', sans-serif" },
                            callback: (value) => `R$ ${value / 1000}k`
                        }
                    }
                }
            }
        });
    };

    form.addEventListener('submit', simularInvestimento);
});