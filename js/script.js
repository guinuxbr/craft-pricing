// @ts-check

/**
 * @fileoverview Craft Pricing - Core Application Logic & Calculation Services
 * ============================================================================
 * This client-side module powers the Craft Pricing application. It calculates fair,
 * transparent, and sustainable prices for handmade craft projects (crochet, knitting,
 * sewing, pottery, woodworking, etc.) by combining material costs, hourly labor rates,
 * and profit margins.
 *
 * Architecture Overview:
 * ----------------------
 * 1. Storage & State: Manages language preferences, color themes, and calculated results.
 * 2. Internationalization (i18n): Reactive multi-language runtime (EN / PT-BR).
 * 3. Theme Management: Dark / light mode switching with system preference detection.
 * 4. Pricing Engine: Validates numeric inputs and executes financial calculations.
 * 5. Clipboard Service: Formats and copies breakdown tables with visual toast feedback.
 * 6. PDF Generator: Produces formatted PDF records via jsPDF with branding and timestamps.
 * 7. Toast Notifications: Non-blocking floating status alerts.
 * 8. Shortcuts & Modals: Centralized keyboard shortcuts and accessibility dialog handlers.
 * 9. Service Worker: PWA offline caching registration.
 *
 * @author Guilherme Marques (https://guinuxbr.com)
 * @license MIT
 */

// ==========================================================================
// Type Definitions (JSDoc Data Models)
// ==========================================================================

/**
 * Input parameters required for craft price calculations.
 * @typedef {Object} CraftCalculationInput
 * @property {string} description - Name or description of the handmade piece.
 * @property {number} skeinWeight - Total weight of a single skein / material unit in grams.
 * @property {number} skeinPrice - Purchase price for a single skein / material unit.
 * @property {number} finishedWeight - Final weight of the crafted piece in grams.
 * @property {number} hourRate - Hourly labor valuation for the artisan's time.
 * @property {number} hoursWorked - Total hours invested in producing the piece.
 * @property {number} profitMargin - Desired business profit margin percentage.
 */

/**
 * Calculated financial output breakdown.
 * @typedef {Object} CraftCalculationResult
 * @property {string} description - Name or description of the piece.
 * @property {number} valuePerGram - Material cost per gram.
 * @property {number} yarnValue - Total material cost used in the finished item.
 * @property {number} labourTotal - Total labor cost based on hours and hourly rate.
 * @property {number} pieceCost - Combined production cost (material + labor).
 * @property {number} profitAmount - Net profit amount in currency.
 * @property {number} finalPrice - Recommended selling price including profit margin.
 */

/**
 * Allowed color theme modes.
 * @typedef {"system" | "light" | "dark"} ThemeMode
 */

/**
 * Allowed toast alert severity types.
 * @typedef {"info" | "success" | "error"} ToastType
 */

/**
 * Supported language keys.
 * @typedef {"en" | "pt"} LanguageCode
 */

// ==========================================================================
// Centralized DOM Element Cache
// ==========================================================================

/**
 * Centralized dictionary of cached DOM element references.
 */
const dom = {
  // --- Header Navigation & Tools ---
  langSelector: /** @type {HTMLSelectElement} */ (document.getElementById("langSelector")),
  btnThemeToggle: /** @type {HTMLButtonElement} */ (document.getElementById("btn-theme-toggle")),
  iconTheme: /** @type {HTMLElement} */ (document.getElementById("icon-theme")),
  btnShortcutsToggle: /** @type {HTMLButtonElement} */ (document.getElementById("btn-shortcuts-toggle")),

  // --- Calculator Form Elements ---
  formCalculator: /** @type {HTMLFormElement} */ (document.getElementById("form-calculator")),
  inputDescription: /** @type {HTMLInputElement} */ (document.getElementById("description")),
  inputSkeinWeight: /** @type {HTMLInputElement} */ (document.getElementById("skein-weight")),
  inputSkeinPrice: /** @type {HTMLInputElement} */ (document.getElementById("skein-price")),
  inputFinishedWeight: /** @type {HTMLInputElement} */ (document.getElementById("finished-weight")),
  inputHourRate: /** @type {HTMLInputElement} */ (document.getElementById("hour-rate")),
  inputHoursWorked: /** @type {HTMLInputElement} */ (document.getElementById("hours-worked")),
  inputProfitMargin: /** @type {HTMLInputElement} */ (document.getElementById("profit-margin")),
  resultMessage: /** @type {HTMLElement} */ (document.getElementById("result")),
  btnCalculate: /** @type {HTMLButtonElement} */ (document.getElementById("ovrd-calculate")),
  btnClear: /** @type {HTMLButtonElement} */ (document.getElementById("ovrd-clean")),

  // --- Results Panel ---
  resultsEmpty: /** @type {HTMLElement} */ (document.getElementById("results-empty")),
  resultsActive: /** @type {HTMLElement} */ (document.getElementById("results-active")),
  highlightPrice: /** @type {HTMLElement} */ (document.getElementById("highlight-price")),
  highlightTitle: /** @type {HTMLElement} */ (document.getElementById("highlight-title")),
  tableResult: /** @type {HTMLElement} */ (document.getElementById("table-result")),
  btnCopy: /** @type {HTMLButtonElement} */ (document.getElementById("ovrd-copy")),
  btnSavePdf: /** @type {HTMLButtonElement} */ (document.getElementById("ovrd-save-pdf")),

  // --- Modals & Toasts ---
  modalShortcuts: /** @type {HTMLElement} */ (document.getElementById("modal-shortcuts")),
  btnCloseShortcuts: /** @type {HTMLButtonElement} */ (document.getElementById("btn-close-shortcuts")),
  btnCloseShortcutsAlt: /** @type {HTMLButtonElement} */ (document.getElementById("btn-close-shortcuts-alt")),
  toastContainer: /** @type {HTMLElement} */ (document.getElementById("toast-container")),
  btnScrollTop: /** @type {HTMLButtonElement} */ (document.getElementById("btn-scroll-top")),
};

// ==========================================================================
// Internationalization (i18n) Runtime
// ==========================================================================

/**
 * Translation dictionary containing English and Portuguese strings.
 * @type {Record<LanguageCode, Record<string, string>>}
 */
const TRANSLATIONS = {
  pt: {
    title: "Preço de Artesanato",
    subtitle: "Calculadora para Artesanato",
    hero_heading: "Preço Justo & Preciso",
    hero_heading_suffix: "Para Seu Artesanato",
    hero_description: "Calcule custos de material, valor do trabalho e margem de lucro para suas peças artesanais em segundos.",
    form_title: "Detalhes do Projeto",
    form_subtitle: "Informe as medidas, tempo e margem de lucro",
    describe_example: "Nome / Descrição da Peça:",
    description_placeholder: "Ex: Blusa de Tricô da Maria",
    skein_weight: "Peso do novelo:",
    skein_price: "Valor do novelo:",
    finished_weight: "Peso da peça pronta:",
    hour_value: "Quanto vale sua hora:",
    total_hours: "Total de horas trabalhadas:",
    profit_margin: "Margem de lucro (%):",
    btn_clean: "Limpar",
    btn_calculate: "Calcular",
    results_title: "Detalhamento de Preço",
    results_subtitle: "Resumo de materiais, mão de obra e lucro",
    explain_calculate: "Pronto para calcular!",
    explain_desc: "Preencha as informações do seu projeto à esquerda e clique em \"Calcular\" para ver o detalhamento completo.",
    explain_copy_pdf: "Você pode copiar o resultado para sua área de transferência ou gerar um relatório PDF da peça.",
    btn_copy: "Copiar Resultado",
    btn_save_pdf: "Salvar PDF",
    error_min: "Os campos numéricos devem ter valor maior que zero (0)!",
    error_fill: "Por favor, preencha todos os campos obrigatórios!",
    no_data_pdf: "Não há dados para geração do PDF.",
    result_thread_value: "Custo do fio / material utilizado:",
    result_hours_value: "Valor das horas trabalhadas:",
    result_production_cost: "Custo de produção da peça:",
    result_should_charge: "Preço Recomendado de Venda:",
    result_profit_value: "Lucro estimado:",
    generated_prefix: "Gerado no Craft Pricing - ",
    toast_calculated: "Cálculo realizado com sucesso!",
    toast_cleared: "Formulário limpo com sucesso!",
    toast_copied: "Detalhamento copiado para a área de transferência!",
    toast_copy_error: "Falha ao copiar para a área de transferência.",
    toast_pdf_saved: "Relatório PDF gerado com sucesso!",
    item_header: "Item / Descrição",
    value_header: "Valor",
    shortcuts_title: "Atalhos do Teclado",
    shortcuts_header: "Atalho",
    action_header: "Ação",
    shortcut_enter: "Calcular preço (dentro de qualquer campo)",
    shortcut_copy: "Copiar tabela para área de transferência",
    shortcut_pdf: "Salvar / Baixar relatório em PDF",
    shortcut_clear: "Limpar / Resetar formulário",
    shortcut_theme: "Alternar modo Escuro / Claro",
    shortcut_guide: "Abrir guia de atalhos",
    shortcut_esc: "Fechar janelas modais",
    btn_got_it: "Entendi"
  },
  en: {
    title: "Craft Pricing",
    subtitle: "Craft Price Calculator",
    hero_heading: "Fair & Accurate",
    hero_heading_suffix: "Pricing For Your Craft",
    hero_description: "Calculate material costs, labor value, and healthy profit margins for all your handmade creations in seconds.",
    form_title: "Project Details",
    form_subtitle: "Enter material measurements, time, and margin",
    describe_example: "Project Name / Description:",
    description_placeholder: "e.g. Handmade Wool Sweater",
    skein_weight: "Skein weight:",
    skein_price: "Skein price:",
    finished_weight: "Finished piece weight:",
    hour_value: "Hourly rate:",
    total_hours: "Total hours worked:",
    profit_margin: "Profit margin (%):",
    btn_clean: "Clear",
    btn_calculate: "Calculate",
    results_title: "Price Breakdown",
    results_subtitle: "Summary of materials, labor & markup",
    explain_calculate: "Ready to calculate!",
    explain_desc: "Fill out your project measurements on the left and click \"Calculate\" to view the complete price breakdown.",
    explain_copy_pdf: "You can copy the result directly to your clipboard or generate a clean PDF invoice/record.",
    btn_copy: "Copy Result",
    btn_save_pdf: "Save PDF",
    error_min: "All numeric fields must be greater than zero (0)!",
    error_fill: "Please fill out all required fields!",
    no_data_pdf: "There is no data to generate the PDF.",
    result_thread_value: "Yarn / material cost used:",
    result_hours_value: "Labor cost for hours worked:",
    result_production_cost: "Total production cost:",
    result_should_charge: "Recommended Selling Price:",
    result_profit_value: "Estimated profit margin:",
    generated_prefix: "Generated by Craft Pricing - ",
    toast_calculated: "Price calculated successfully!",
    toast_cleared: "Form cleared successfully!",
    toast_copied: "Price breakdown copied to clipboard!",
    toast_copy_error: "Failed to copy to clipboard.",
    toast_pdf_saved: "PDF record generated successfully!",
    item_header: "Item / Description",
    value_header: "Value",
    shortcuts_title: "Keyboard Shortcuts",
    shortcuts_header: "Shortcut",
    action_header: "Action",
    shortcut_enter: "Calculate price (when inside input)",
    shortcut_copy: "Copy calculated result table to clipboard",
    shortcut_pdf: "Save / Download PDF summary",
    shortcut_clear: "Clear / Reset form inputs",
    shortcut_theme: "Toggle Dark / Light theme mode",
    shortcut_guide: "Open Keyboard Shortcuts guide",
    shortcut_esc: "Close modal dialogs",
    btn_got_it: "Got it"
  }
};

// ==========================================================================
// Application State
// ==========================================================================

/**
 * Centralized application state model.
 */
const state = {
  /** @type {LanguageCode} */
  language: "en",
  /** @type {ThemeMode} */
  theme: "system",
  /** @type {CraftCalculationResult | null} */
  lastResult: null,
};

// ==========================================================================
// i18n Functions
// ==========================================================================

/**
 * Retrieve translation string for a given key in the current language.
 * @param {string} key - Dictionary translation key.
 * @returns {string} Translated string or fallback key.
 */
function t(key) {
  const lang = state.language;
  if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
    return TRANSLATIONS[lang][key];
  }
  if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
    return TRANSLATIONS.en[key];
  }
  return key;
}

/**
 * Updates all DOM elements bearing data-i18n and data-i18n-placeholder attributes.
 */
function translateUI() {
  // Text content elements
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      el.textContent = t(key);
    }
  });

  // Placeholder attributes
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) {
      /** @type {HTMLInputElement} */ (el).placeholder = t(key);
    }
  });

  // If calculation active, re-render result table for updated language strings
  if (state.lastResult) {
    renderResults(state.lastResult);
  }
}

/**
 * Set active application language and sync with selector.
 * @param {LanguageCode} lang - Target language code ('en' | 'pt').
 */
function setLanguage(lang) {
  state.language = lang;
  localStorage.setItem("craft_lang", lang);
  if (dom.langSelector) {
    dom.langSelector.value = lang;
  }
  translateUI();
}

// ==========================================================================
// Theme Management
// ==========================================================================

/**
 * Apply the selected theme mode to the HTML root element.
 * @param {ThemeMode} mode - Theme mode to apply.
 */
function applyTheme(mode) {
  state.theme = mode;
  const root = document.documentElement;

  if (mode === "system") {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    root.setAttribute("data-theme", mode);
  }

  // Update theme toggle icon
  if (dom.iconTheme) {
    const effectiveTheme = root.getAttribute("data-theme");
    if (effectiveTheme === "dark") {
      dom.iconTheme.className = "fa-solid fa-sun";
      if (dom.btnThemeToggle) dom.btnThemeToggle.title = "Switch to Light Theme (T)";
    } else {
      dom.iconTheme.className = "fa-solid fa-moon";
      if (dom.btnThemeToggle) dom.btnThemeToggle.title = "Switch to Dark Theme (T)";
    }
  }
}

/**
 * Toggle theme between light and dark modes.
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = current === "dark" ? "light" : "dark";
  localStorage.setItem("craft_theme", newTheme);
  applyTheme(/** @type {ThemeMode} */ (newTheme));
}

// ==========================================================================
// Toast Notification Engine
// ==========================================================================

/**
 * Displays a non-blocking toast alert in the floating container.
 * @param {string} message - Message text to display.
 * @param {ToastType} [type="info"] - Toast severity variant.
 * @param {number} [duration=3500] - Duration in milliseconds before dismissing.
 */
function showToast(message, type = "info", duration = 3500) {
  if (!dom.toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");

  let iconClass = "fa-circle-info";
  if (type === "success") iconClass = "fa-circle-check";
  if (type === "error") iconClass = "fa-circle-exclamation";

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${message}</span>
  `;

  dom.toastContainer.appendChild(toast);

  // Trigger entrance transition
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Auto remove after timeout
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// ==========================================================================
// Number & Currency Formatting
// ==========================================================================

/**
 * Formats a number to localized currency representation.
 * @param {number} value - Number to format.
 * @returns {string} Formatted number string.
 */
function formatCurrency(value) {
  const locale = state.language === "en" ? "en-US" : "pt-BR";
  return Number(value).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ==========================================================================
// Validation & Calculations
// ==========================================================================

/**
 * Validates all calculator form inputs.
 * @returns {boolean} True if all inputs are valid, false otherwise.
 */
function validateInputs() {
  const description = dom.inputDescription?.value.trim() || "";
  const skeinWeight = parseFloat(dom.inputSkeinWeight?.value || "0");
  const skeinPrice = parseFloat(dom.inputSkeinPrice?.value || "0");
  const finishedWeight = parseFloat(dom.inputFinishedWeight?.value || "0");
  const hourRate = parseFloat(dom.inputHourRate?.value || "0");
  const hoursWorked = parseFloat(dom.inputHoursWorked?.value || "0");
  const profitMargin = parseFloat(dom.inputProfitMargin?.value || "0");

  // Clear previous inline errors
  if (dom.resultMessage) {
    dom.resultMessage.innerHTML = "";
  }

  // Remove input error highlights
  const inputs = [
    dom.inputDescription,
    dom.inputSkeinWeight,
    dom.inputSkeinPrice,
    dom.inputFinishedWeight,
    dom.inputHourRate,
    dom.inputHoursWorked,
    dom.inputProfitMargin
  ];
  inputs.forEach((input) => input?.classList.remove("input-error"));

  // Check empty required fields
  if (
    !description ||
    isNaN(skeinWeight) ||
    isNaN(skeinPrice) ||
    isNaN(finishedWeight) ||
    isNaN(hourRate) ||
    isNaN(hoursWorked) ||
    isNaN(profitMargin)
  ) {
    if (dom.resultMessage) {
      dom.resultMessage.innerHTML = `
        <div class="alert-box alert-danger">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>${t("error_fill")}</span>
        </div>
      `;
    }
    showToast(t("error_fill"), "error");
    return false;
  }

  // Check minimum numeric constraints (> 0 for weights and rates, >= 0 for profit)
  if (
    skeinWeight <= 0 ||
    skeinPrice <= 0 ||
    finishedWeight <= 0 ||
    hourRate <= 0 ||
    hoursWorked <= 0 ||
    profitMargin < 0
  ) {
    if (dom.resultMessage) {
      dom.resultMessage.innerHTML = `
        <div class="alert-box alert-danger">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span>${t("error_min")}</span>
        </div>
      `;
    }
    showToast(t("error_min"), "error");
    return false;
  }

  return true;
}

/**
 * Calculates pricing metrics from form values and renders the results panel.
 */
function calculate() {
  if (!validateInputs()) return;

  const description = dom.inputDescription.value.trim();
  const skeinWeight = parseFloat(dom.inputSkeinWeight.value);
  const skeinPrice = parseFloat(dom.inputSkeinPrice.value);
  const finishedWeight = parseFloat(dom.inputFinishedWeight.value);
  const hourRate = parseFloat(dom.inputHourRate.value);
  const hoursWorked = parseFloat(dom.inputHoursWorked.value);
  const profitMargin = parseFloat(dom.inputProfitMargin.value);

  // Financial calculations
  const valuePerGram = skeinPrice / skeinWeight;
  const yarnValue = valuePerGram * finishedWeight;
  const labourTotal = hourRate * hoursWorked;
  const pieceCost = yarnValue + labourTotal;
  const profitAmount = pieceCost * (profitMargin / 100);
  const finalPrice = pieceCost + profitAmount;

  /** @type {CraftCalculationResult} */
  const result = {
    description,
    valuePerGram,
    yarnValue,
    labourTotal,
    pieceCost,
    profitAmount,
    finalPrice
  };

  state.lastResult = result;
  renderResults(result);
  showToast(t("toast_calculated"), "success");
}

/**
 * Renders calculated data into the results panel and table.
 * @param {CraftCalculationResult} result - Calculated metrics.
 */
function renderResults(result) {
  if (!dom.resultsEmpty || !dom.resultsActive || !dom.tableResult) return;

  dom.resultsEmpty.style.display = "none";
  dom.resultsActive.style.display = "flex";

  // Highlight badge
  if (dom.highlightPrice) dom.highlightPrice.textContent = formatCurrency(result.finalPrice);
  if (dom.highlightTitle) dom.highlightTitle.textContent = result.description;

  // Breakdown table
  dom.tableResult.innerHTML = `
    <table class="breakdown-table" id="result-table-copy">
      <thead>
        <tr>
          <th>${t("item_header")}</th>
          <th style="text-align: right;">${t("value_header")}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><i class="fa-solid fa-cube"></i> ${t("result_thread_value")}</td>
          <td class="val-col">${formatCurrency(result.yarnValue)}</td>
        </tr>
        <tr>
          <td><i class="fa-solid fa-clock"></i> ${t("result_hours_value")}</td>
          <td class="val-col">${formatCurrency(result.labourTotal)}</td>
        </tr>
        <tr>
          <td><i class="fa-solid fa-industry"></i> ${t("result_production_cost")}</td>
          <td class="val-col">${formatCurrency(result.pieceCost)}</td>
        </tr>
        <tr>
          <td><i class="fa-solid fa-chart-line"></i> ${t("result_profit_value")}</td>
          <td class="val-col">${formatCurrency(result.profitAmount)}</td>
        </tr>
        <tr class="total-row">
          <td><i class="fa-solid fa-tags"></i> <strong>${t("result_should_charge")}</strong></td>
          <td class="val-col" style="font-size: 1.1rem; color: var(--accent);">
            <strong>${formatCurrency(result.finalPrice)}</strong>
          </td>
        </tr>
      </tbody>
    </table>
  `;
}

/**
 * Resets all calculator form fields and returns results panel to empty state.
 */
function clean() {
  if (dom.formCalculator) dom.formCalculator.reset();
  if (dom.resultMessage) dom.resultMessage.innerHTML = "";

  state.lastResult = null;

  if (dom.resultsEmpty && dom.resultsActive) {
    dom.resultsEmpty.style.display = "flex";
    dom.resultsActive.style.display = "none";
  }

  showToast(t("toast_cleared"), "info");
}

// ==========================================================================
// Clipboard & Export Services
// ==========================================================================

/**
 * Copies the itemized price breakdown table as formatted text to the clipboard.
 */
async function copyResult() {
  if (!state.lastResult) {
    showToast(t("no_data_pdf"), "error");
    return;
  }

  const res = state.lastResult;
  const copyText = [
    `========================================`,
    `Craft Pricing: ${res.description}`,
    `========================================`,
    `${t("result_thread_value")} ${formatCurrency(res.yarnValue)}`,
    `${t("result_hours_value")} ${formatCurrency(res.labourTotal)}`,
    `${t("result_production_cost")} ${formatCurrency(res.pieceCost)}`,
    `${t("result_profit_value")} ${formatCurrency(res.profitAmount)}`,
    `----------------------------------------`,
    `${t("result_should_charge")} ${formatCurrency(res.finalPrice)}`,
    `========================================`,
    `${t("generated_prefix")}https://craftpricing.guinuxbr.com`
  ].join("\n");

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(copyText);
    } else {
      // Fallback for older browser contexts
      const textarea = document.createElement("textarea");
      textarea.value = copyText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    showToast(t("toast_copied"), "success");
  } catch (err) {
    console.error("Failed to copy table to clipboard:", err);
    showToast(t("toast_copy_error"), "error");
  }
}

/**
 * Generates and downloads a clean PDF invoice/record using jsPDF.
 */
function save_pdf() {
  if (!state.lastResult) {
    showToast(t("no_data_pdf"), "error");
    return;
  }

  // @ts-ignore
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast("PDF library loading, please try again...", "error");
    return;
  }

  const res = state.lastResult;
  // @ts-ignore
  const doc = new window.jspdf.jsPDF();
  const date = new Date();
  const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  // Top header branding
  const logoImg = new Image();
  logoImg.src = "images/logo.png";

  try {
    doc.addImage(logoImg, "PNG", 85, 12, 40, 40);
  } catch (e) {
    // Continue if logo fails to draw in offline mode
  }

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Craft Pricing", 105, 62, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(res.description, 105, 72, { align: "center" });

  // Breakdown lines
  doc.setFontSize(11);
  let yPos = 90;

  const rows = [
    [`${t("result_thread_value")}`, formatCurrency(res.yarnValue)],
    [`${t("result_hours_value")}`, formatCurrency(res.labourTotal)],
    [`${t("result_production_cost")}`, formatCurrency(res.pieceCost)],
    [`${t("result_profit_value")}`, formatCurrency(res.profitAmount)],
    [`${t("result_should_charge")}`, formatCurrency(res.finalPrice)]
  ];

  // Draw table box
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(25, yPos - 5, 185, yPos - 5);

  rows.forEach(([label, val], idx) => {
    if (idx === rows.length - 1) {
      doc.setFont("helvetica", "bold");
      doc.line(25, yPos - 3, 185, yPos - 3);
    } else {
      doc.setFont("helvetica", "normal");
    }
    doc.text(label, 30, yPos + 3);
    doc.text(val, 180, yPos + 3, { align: "right" });
    yPos += 12;
  });

  doc.line(25, yPos - 3, 185, yPos - 3);

  // Footer date & website link
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const footerText = `${t("generated_prefix")} ${dateStr}`;
  doc.text(footerText, 105, 275, { align: "center" });

  const linkUrl = "https://craftpricing.guinuxbr.com";
  doc.textWithLink(linkUrl, 105, 282, { url: linkUrl, align: "center" });

  // Sanitize filename
  const cleanDesc = res.description.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
  doc.save(`CraftPricing-${cleanDesc || "project"}.pdf`);
  showToast(t("toast_pdf_saved"), "success");
}

// ==========================================================================
// Modal & Dialog Handlers
// ==========================================================================

/**
 * Opens the Keyboard Shortcuts help modal.
 */
function openShortcutsModal() {
  if (dom.modalShortcuts) {
    dom.modalShortcuts.classList.add("active");
    dom.modalShortcuts.setAttribute("aria-hidden", "false");
  }
}

/**
 * Closes the Keyboard Shortcuts help modal.
 */
function closeShortcutsModal() {
  if (dom.modalShortcuts) {
    dom.modalShortcuts.classList.remove("active");
    dom.modalShortcuts.setAttribute("aria-hidden", "true");
  }
}

// ==========================================================================
// Keyboard Shortcuts Engine
// ==========================================================================

/**
 * Initializes global keyboard navigation shortcuts.
 */
function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ignore global keybindings when typing inside input or textarea
    const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(/** @type {HTMLElement} */ (e.target).tagName);

    if (e.key === "Escape") {
      closeShortcutsModal();
      return;
    }

    if (e.key === "Enter" && isTyping) {
      calculate();
      return;
    }

    if (isTyping) return;

    if (e.key === "t" || e.key === "T") {
      e.preventDefault();
      toggleTheme();
    } else if (e.key === "c" || e.key === "C") {
      e.preventDefault();
      copyResult();
    } else if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      save_pdf();
    } else if (e.key === "l" || e.key === "L") {
      e.preventDefault();
      clean();
    } else if (e.key === "?") {
      e.preventDefault();
      openShortcutsModal();
    }
  });
}

// ==========================================================================
// Scroll To Top Engine
// ==========================================================================

/**
 * Initializes floating scroll-to-top button handler.
 */
function initScrollTop() {
  if (!dom.btnScrollTop) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 250) {
      dom.btnScrollTop.classList.add("visible");
    } else {
      dom.btnScrollTop.classList.remove("visible");
    }
  }, { passive: true });

  dom.btnScrollTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ==========================================================================
// Service Worker Registration
// ==========================================================================

/**
 * Registers Progressive Web App service worker for offline support.
 */
function initServiceWorker() {
  if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((err) => {
        console.warn("ServiceWorker registration failed:", err);
      });
    });
  }
}

// ==========================================================================
// Application Bootstrap & Lifecycle
// ==========================================================================

/**
 * Initializes the Craft Pricing application.
 */
function init() {
  // Load saved theme or match system
  const savedTheme = /** @type {ThemeMode | null} */ (localStorage.getItem("craft_theme"));
  applyTheme(savedTheme || "system");

  // Listen for OS color scheme changes
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("craft_theme")) {
        applyTheme("system");
      }
    });
  }

  // Load saved language or detect browser language
  const savedLang = /** @type {LanguageCode | null} */ (localStorage.getItem("craft_lang"));
  if (savedLang && ["en", "pt"].includes(savedLang)) {
    setLanguage(savedLang);
  } else {
    const browserLang = navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
    setLanguage(browserLang);
  }

  // Wire up event listeners
  if (dom.btnThemeToggle) dom.btnThemeToggle.addEventListener("click", toggleTheme);
  if (dom.btnShortcutsToggle) dom.btnShortcutsToggle.addEventListener("click", openShortcutsModal);
  if (dom.btnCloseShortcuts) dom.btnCloseShortcuts.addEventListener("click", closeShortcutsModal);
  if (dom.btnCloseShortcutsAlt) dom.btnCloseShortcutsAlt.addEventListener("click", closeShortcutsModal);

  if (dom.langSelector) {
    dom.langSelector.addEventListener("change", (e) => {
      const target = /** @type {HTMLSelectElement} */ (e.target);
      setLanguage(/** @type {LanguageCode} */ (target.value));
    });
  }

  if (dom.btnCalculate) dom.btnCalculate.addEventListener("click", calculate);
  if (dom.btnClear) dom.btnClear.addEventListener("click", clean);
  if (dom.btnCopy) dom.btnCopy.addEventListener("click", copyResult);
  if (dom.btnSavePdf) dom.btnSavePdf.addEventListener("click", save_pdf);

  // Close modal when clicking on backdrop
  if (dom.modalShortcuts) {
    dom.modalShortcuts.addEventListener("click", (e) => {
      if (e.target === dom.modalShortcuts) {
        closeShortcutsModal();
      }
    });
  }

  initKeyboardShortcuts();
  initScrollTop();
  initServiceWorker();
}

// Start application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
