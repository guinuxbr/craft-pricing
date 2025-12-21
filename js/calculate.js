function calculate() {
  if (typeof validate === 'function' && validate()) {
    let $ = document.querySelector.bind(document);
    let description = $("#description").value;
    let skeinWeight = $("#skein-weight").value;
    let skeinPrice = $("#skein-price").value;
    let finishedWeight = $("#finished-weight").value;
    let hourRate = $("#hour-rate").value;
    let hoursWorked = $("#hours-worked").value;
    let profitMargin = $("#profit-margin").value;
    let resultEl = $("#result");
    let resultTable = $("#table-result");

    // calculations
    let valuePerGram = skeinPrice / skeinWeight;
    let yarnValue = valuePerGram * finishedWeight;
    let labourTotal = hourRate * hoursWorked;
    let pieceCost = yarnValue + labourTotal;
    let finalPrice = pieceCost + pieceCost * (profitMargin / 100);

    const lang = (window.i18n && window.i18n.currentLang) || 'pt';
    const locale = lang === 'en' ? 'en-GB' : 'pt-BR';

    const t = (k) => (window.i18n && window.i18n.get ? window.i18n.get(k) : k);

    const fmt = (v) => Number(v).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    resultTable.innerHTML = `
        <table class="table is-bordered" id="result-table-copy">
            <tbody>
                <tr>
                <th colspan="2" style="text-align: center;">${description}</th>
                </tr>
                <tr>
                <td>${t('result_thread_value')}</td>
                <td><strong>${fmt(yarnValue)}</strong>
                </td>
                </tr>
                <tr>
                <td>${t('result_hours_value')}</td>
                <td><strong>${fmt(labourTotal)}</strong>
                </td>
                </tr>
                <tr>
                <td>${t('result_production_cost')}</td>
                <td><strong>${fmt(pieceCost)}</strong>
                </td>
                </tr>
                <tr>
                <td>${t('result_should_charge')}</td>
                <td><strong>${fmt(finalPrice)}</strong>
                </td>
                </tr>
            </tbody>
        </table>
        `;

    let savePdfButton = $("#ovrd-save-pdf");
    savePdfButton.classList.remove("is-hidden");

    let copyButton = $("#ovrd-copy");
    copyButton.classList.remove("is-hidden");
  }
}
