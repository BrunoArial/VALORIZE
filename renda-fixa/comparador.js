document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('controls-form');
    const tableBody = document.querySelector('#offers-table tbody');
    const clearBtn = document.getElementById('clear-btn');
    const investmentTypeSelect = document.getElementById('investment-type');

    const fieldGroups = {
        'cdb': document.getElementById('fields-cdb'),
        'lci-lca': document.getElementById('fields-lci-lca'),
        'tesouro-selic': null,
        'tesouro-prefixado': document.getElementById('fields-tesouro-prefixado'),
        'tesouro-ipca': document.getElementById('fields-tesouro-ipca')
    };

    let offers = [];

    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const getIrRate = (days) => {
        if (days <= 180) return 0.225;
        if (days <= 360) return 0.20;
        if (days <= 720) return 0.175;
        return 0.15;
    };

    const calculateLCI = (principal, annualRate, months) => {
        const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
        const finalValue = principal * Math.pow(1 + monthlyRate, months);
        return finalValue;
    };

    const calculateCDB = (principal, annualRate, months) => {
        const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
        const grossValue = principal * Math.pow(1 + monthlyRate, months);
        const grossInterest = grossValue - principal;
        
        const irRate = getIrRate(months * 30);
        const irValue = grossInterest * irRate;
        const netValue = grossValue - irValue;
        
        return netValue;
    };

    const calculateTesouro = (principal, annualRate, months, type) => {
        const TAXA_B3_ANUAL = 0.0020;
        const years = months / 12;
        
        const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
        const grossValue = principal * Math.pow(1 + monthlyRate, months);
        const grossInterest = grossValue - principal;
        let b3Fee = 0;
        if (type === 'tesouro-selic' && principal > 10000) {
            b3Fee = (principal - 10000) * TAXA_B3_ANUAL * years;
        } else if (type !== 'tesouro-selic') {
            b3Fee = principal * TAXA_B3_ANUAL * years;
        }
        b3Fee = Math.max(0, b3Fee); 

        const taxableInterest = grossInterest - b3Fee;
        const irRate = getIrRate(months * 30);
        const irValue = (taxableInterest > 0) ? taxableInterest * irRate : 0;

        const netValue = grossValue - b3Fee - irValue;
        return netValue;
    };

    const updateVisibleFields = () => {
        const selectedType = investmentTypeSelect.value;

        Object.values(fieldGroups).forEach(group => {
            if (group) group.style.display = 'none';
        });

        if (fieldGroups[selectedType]) {
            fieldGroups[selectedType].style.display = 'block';
        }
    };

    const renderTable = () => {
        tableBody.innerHTML = '';

        if (offers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhum investimento adicionado.</td></tr>`;
            return;
        }

        const bestNetValue = Math.max(...offers.map(offer => offer.netValue));

        offers.forEach((offer, index) => {
            const isBest = offer.netValue === bestNetValue;
            const row = document.createElement('tr');
            if (isBest) {
                row.classList.add('best');
            }
            row.innerHTML = `
                <td data-label="Investimento">${offer.name}</td>
                <td data-label="Tipo">${offer.typeLabel}</td>
                <td data-label="Prazo">${offer.months} meses</td>
                <td data-label="Valor Líquido Final">${formatCurrency(offer.netValue)}</td>
                <td data-label="Ações"><button class="del-btn" data-index="${index}">Remover</button></td>
            `;
            tableBody.appendChild(row);
        });
    };

    investmentTypeSelect.addEventListener('change', updateVisibleFields);

    clearBtn.addEventListener('click', () => {
        offers = [];
        renderTable();
    });

    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('del-btn')) {
            const indexToRemove = parseInt(e.target.dataset.index, 10);
            offers.splice(indexToRemove, 1);
            renderTable();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('investment-name').value;
        const principal = parseFloat(document.getElementById('principal').value);
        const months = parseInt(document.getElementById('months').value);
        const baseRate = parseFloat(document.getElementById('base-rate').value) / 100;
        const type = investmentTypeSelect.value;
        const typeLabel = investmentTypeSelect.options[investmentTypeSelect.selectedIndex].text;

        let effectiveAnnualRate;
        let netValue;

        try {
            switch (type) {
                case 'cdb':
                    const rateCdb = parseFloat(document.getElementById('rate-cdb').value) / 100;
                    effectiveAnnualRate = baseRate * rateCdb;
                    netValue = calculateCDB(principal, effectiveAnnualRate, months);
                    break;
                
                case 'lci-lca':
                    const rateLci = parseFloat(document.getElementById('rate-lci-lca').value) / 100;
                    effectiveAnnualRate = baseRate * rateLci;
                    netValue = calculateLCI(principal, effectiveAnnualRate, months);
                    break;

                case 'tesouro-selic':
                    effectiveAnnualRate = baseRate;
                    netValue = calculateTesouro(principal, effectiveAnnualRate, months, 'tesouro-selic');
                    break;

                case 'tesouro-prefixado':
                    effectiveAnnualRate = parseFloat(document.getElementById('rate-prefixado').value) / 100;
                    netValue = calculateTesouro(principal, effectiveAnnualRate, months, 'tesouro-prefixado');
                    break;

                case 'tesouro-ipca':
                    const rateIpcaReal = parseFloat(document.getElementById('rate-ipca-real').value) / 100;
                    const rateIpcaEstimado = parseFloat(document.getElementById('rate-ipca-estimado').value) / 100;
                    effectiveAnnualRate = (1 + rateIpcaReal) * (1 + rateIpcaEstimado) - 1;
                    netValue = calculateTesouro(principal, effectiveAnnualRate, months, 'tesouro-ipca');
                    break;
                
                default:
                    throw new Error('Tipo de investimento desconhecido.');
            }


            offers.push({
                id: Date.now(),
                name,
                typeLabel,
                months,
                netValue
            });


            renderTable();
            
            document.getElementById('investment-name').value = '';
            document.getElementById('investment-name').focus();

        } catch (error) {
            alert('Erro ao calcular. Verifique se todos os campos estão preenchidos corretamente. ' + error.message);
        }
    });

    updateVisibleFields();
    renderTable();
});