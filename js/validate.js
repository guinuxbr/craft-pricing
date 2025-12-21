function validate() {
  let $ = document.querySelector.bind(document);
  let description = $("#description").value;
  let skeinWeight = $("#skein-weight").value;
  let skeinPrice = $("#skein-price").value;
  let finishedWeight = $("#finished-weight").value;
  let hourRate = $("#hour-rate").value;
  let hoursWorked = $("#hours-worked").value;
  let profitMargin = $("#profit-margin").value;
  let resultEl = $("#result");

  const t = (k) => (window.i18n && window.i18n.get ? window.i18n.get(k) : k);

  if (
    skeinWeight < 1 ||
    skeinPrice < 1 ||
    finishedWeight < 1 ||
    hourRate < 1 ||
    hoursWorked < 1 ||
    profitMargin < 1
  ) {
    resultEl.innerHTML = `<div class="notification is-danger is-light">${t('error_min')}</div>`;
    return false
  } else if (
    description == "" ||
    skeinWeight == "" ||
    skeinPrice == "" ||
    finishedWeight == "" ||
    hourRate == "" ||
    hoursWorked == "" ||
    profitMargin == ""
  ) {
    resultEl.innerHTML = `<div class="notification is-danger is-light">${t('error_fill')}</div>`;
    return false
  } else {
    return true
  }

}
