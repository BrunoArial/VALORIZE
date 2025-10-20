document.addEventListener('DOMContentLoaded', () => {
    const prazoInput = document.getElementById('prazo-meses');
    const lciInput = document.getElementById('taxa-lci');
    const cdbInput = document.getElementById('taxa-cdb');
    const irRateDisplay = document.getElementById('ir-rate-display');
    const resultText = document.getElementById('result-text');
    const resLci = document.getElementById('res-lci');
    const resCdb = document.getElementById('res-cdb');
    const getIrRate = (months) => {
        const days = months * 30;
        if (days <= 180) return { rate: 0.225, label: "22.5%" }; 
        if (days <= 360) return { rate: 0.200, label: "20.0%" }; 
        if (days <= 720) return { rate: 0.175, label: "17.5%" };
        return { rate: 0.150, label: "15.0%" }; 
    };


    const calculateEquivalence = (source) => {
        const months = parseInt(prazoInput.value) || 0;
        const lciRate = parseFloat(lciInput.value) || 0;
        const cdbRate = parseFloat(cdbInput.value) || 0;

        if (months === 0) {
            resultText.textContent = "Por favor, insira um prazo válido em meses.";
            return;
        }

        const ir = getIrRate(months);
        irRateDisplay.textContent = `Sofre IR de ${ir.label}`;

        let equivalentLci, equivalentCdb;

        if (source === 'lci') {
            if (lciRate === 0) {
                cdbInput.value = '';
                return;
            }
            equivalentCdb = lciRate / (1 - ir.rate);
            cdbInput.value = equivalentCdb.toFixed(2);

            updateResultText(lciRate, equivalentCdb, months);

        } else if (source === 'cdb') {

            if (cdbRate === 0) {
                lciInput.value = '';
                return;
            }
            equivalentLci = cdbRate * (1 - ir.rate);
            lciInput.value = equivalentLci.toFixed(2);

            updateResultText(equivalentLci, cdbRate, months);
        }
    };

    const updateResultText = (lci, cdb, months) => {
        const cdbFormatted = parseFloat(cdb).toFixed(2);
        const lciFormatted = parseFloat(lci).toFixed(2);
        
        let conclusion = '';
        if (lci > 0 && cdb > 0) {
            conclusion = `Neste prazo, uma LCI/LCA a ${lciFormatted}% do CDI é equivalente a um CDB a ${cdbFormatted}% do CDI.`;
        } else {
            conclusion = 'Preencha os campos para ver a comparação.';
        }
        
        resultText.textContent = conclusion;
        resLci.textContent = `${lciFormatted}%`;
        resCdb.textContent = `${cdbFormatted}%`;
    };

    lciInput.addEventListener('input', () => calculateEquivalence('lci'));
    cdbInput.addEventListener('input', () => calculateEquivalence('cdb'));

    prazoInput.addEventListener('input', () => {
        if (lciInput.value) {
            calculateEquivalence('lci');
        } else {
            calculateEquivalence('cdb');
        }
    });

    lciInput.value = 95;
    calculateEquivalence('lci');
});