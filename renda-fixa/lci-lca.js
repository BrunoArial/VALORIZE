document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('controls-form');
    const tableBody = document.querySelector('#offers-table tbody');
    const clearBtn = document.getElementById('clear-btn');

    let offers = [];

    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const renderTable = () => {
        tableBody.innerHTML = '';

        if (offers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhuma oferta adicionada.</td></tr>`;
            return;
        }

        const bestOfferValue = Math.max(...offers.map(offer => offer.finalValue));

        offers.forEach((offer, index) => {
            const isBest = offer.finalValue === bestOfferValue;
            const row = document.createElement('tr');
            if (isBest) {
                row.classList.add('best');
            }
            row.innerHTML = `
                <td>${offer.bank} (${offer.kind})</td>
                <td>${offer.rate}% do CDI</td>
                <td>${offer.months} meses</td>
                <td>${formatCurrency(offer.finalValue)}</td>
                <td><button class="del-btn" data-index="${index}">Remover</button></td>
            `;
            tableBody.appendChild(row);
        });
    };
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const bank = document.getElementById('bank').value;
        const kind = document.getElementById('kind').value;
        const rate = parseFloat(document.getElementById('rate').value);
        const months = parseInt(document.getElementById('months').value);
        const principal = parseFloat(document.getElementById('principal').value);
        const cdi = parseFloat(document.getElementById('cdi').value) / 100;

        if (!bank || isNaN(rate) || isNaN(months) || isNaN(principal) || isNaN(cdi)) {
            alert('Por favor, preencha todos os campos com valores válidos.');
            return;
        }

        const effectiveAnnualRate = cdi * (rate / 100);
        const effectiveMonthlyRate = Math.pow(1 + effectiveAnnualRate, 1 / 12) - 1;
        const finalValue = principal * Math.pow(1 + effectiveMonthlyRate, months);

        offers.push({
            id: Date.now(),
            bank,
            kind,
            rate,
            months,
            principal,
            finalValue
        });

        renderTable();
        document.getElementById('bank').value = '';
        document.getElementById('bank').focus();
    });

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
    renderTable();
});
