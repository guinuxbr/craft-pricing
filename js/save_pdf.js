// Generate a PDF with the result.
function save_pdf() {
  let tableResult = document.getElementById('table-result');
  let result = document.getElementById('result');
  const t = (k) => (window.i18n && window.i18n.get ? window.i18n.get(k) : k);

  if (!tableResult || tableResult.innerText.trim() === "") {
    if (result) result.innerHTML = `<div class="notification is-danger is-light">${t('no_data_pdf')}</div>`;
  } else {
    var imgData = new Image();
    imgData.src = 'images/logo.png';
    var description = document.getElementById("description").value;
    var docPDF = new window.jspdf.jsPDF();
    const date = new Date();
    docPDF.text(tableResult.innerText, 20, 150);
    // Add the image to the top of the PDF centralised
    docPDF.addImage(imgData, "PNG", 80, 10, 50, 50, "NONE");
    docPDF.setFontSize(10);
    // Add footer with generation date
    var footer = `${t('generated_prefix')} ${date.getDate()}/${(date.getMonth() + 1)}/${date.getFullYear()}`;
    docPDF.text(footer, 100, 280, "center");
    const linkText = 'https://craftpricing.guinuxbr.com';
    const url = 'https://craftpricing.guinuxbr.com';

    // 1. Get total page width
    const pageWidth = docPDF.internal.pageSize.getWidth();
    const pageHeight = docPDF.internal.pageSize.getHeight();

    // 2. Set font size (Important: do this BEFORE measuring width)
    docPDF.setFontSize(10);

    // 3. Measure the exact width of your string in the current font/size
    const stringWidth = docPDF.getTextWidth(linkText);

    // 4. Calculate the starting X position
    // This offsets the starting point so the middle of the text hits the middle of the page
    const x = (pageWidth / 2) - (stringWidth / 2);

    // 5. Position at the bottom (e.g., 10 units from the edge)
    const y = pageHeight - 10;

    docPDF.textWithLink(linkText, x, y, { url: url });
    docPDF.save("CraftPricing-" + description + ".pdf");
  }
}
