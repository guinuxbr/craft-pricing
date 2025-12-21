/* Simple i18n runtime for PT-BR and EN */
(function () {
    const TRANSLATIONS = {
        pt: {
            title: "Preço de Artesanato",
            subtitle: "CALCULADORA PARA ARTESANATO",
            describe_example: "Descreva seu trabalho. Por exemplo: Blusa de Fulano",
            description_placeholder: "Blusa de Fulano",
            skein_weight: "Peso do novelo em gramas(g):",
            skein_price: "Valor do novelo:",
            finished_weight: "Peso da peça pronta em gramas(g):",
            hour_value: "Quanto vale sua hora:",
            total_hours: "Total de horas trabalhadas:",
            profit_margin: "Margem de lucro (%):",
            btn_clean: "Limpar",
            btn_calculate: "Calcular",
            explain_calculate: "Ao clicar em \"Calcular\" o resultado será exibido aqui.",
            explain_copy_pdf: "É possível copiar o resultado e colar diretamente numa planilha. Também é possível salvar um arquivo PDF com as informações geradas.",
            btn_copy: "Copiar",
            btn_save_pdf: "Salvar PDF",
            error_min: "Os campos devem ter o valor de, no mínimo, 1 (um)!!!",
            error_fill: "Você deve preencher todos os campos!!!",
            no_data_pdf: "Não há dados para geração do PDF.",
            result_thread_value: "O valor do fio utilizado foi:",
            result_hours_value: "O valor das horas trabalhadas foi:",
            result_production_cost: "O custo de produção da peça foi de:",
            result_should_charge: "Você deve cobrar, aproximadamente:",
            generated_prefix: "Gerado no Craft Pricing - ",
        },
        en: {
            title: "Craft Pricing",
            subtitle: "CRAFT PRICE CALCULATOR",
            describe_example: "Describe your work. For example: John's Sweater",
            description_placeholder: "e.g. John's Sweater",
            skein_weight: "Skein weight (g):",
            skein_price: "Skein price:",
            finished_weight: "Finished piece weight (g):",
            hour_value: "How much is your hour worth:",
            total_hours: "Total hours worked:",
            profit_margin: "Profit margin (%):",
            btn_clean: "Clear",
            btn_calculate: "Calculate",
            explain_calculate: "Click \"Calculate\" to show the result here.",
            explain_copy_pdf: "You can copy the result and paste it into a spreadsheet. You can also save a PDF with the generated information.",
            btn_copy: "Copy",
            btn_save_pdf: "Save PDF",
            error_min: "The fields must have a value of at least 1 (one)!!!",
            error_fill: "You must fill out all fields!",
            no_data_pdf: "There is no data to generate the PDF.",
            result_thread_value: "The value of the yarn used was:",
            result_hours_value: "The value of hours worked was:",
            result_production_cost: "The production cost of the piece was:",
            result_should_charge: "You should charge, approximately:",
            generated_prefix: "Generated on Craft Pricing - ",
        }
    };

    let currentLang = 'en';

    function get(key) {
        return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || TRANSLATIONS['pt'][key] || key;
    }

    function translateAll(lang = 'pt') {
        currentLang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const txt = get(key);
            if (txt !== undefined) el.textContent = txt;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const txt = get(key);
            if (txt !== undefined && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) el.placeholder = txt;
        });
        // store current
        window.i18n = window.i18n || {};
        window.i18n.currentLang = currentLang;
        window.i18n.get = get;
        window.i18n.translateAll = translateAll;
        window.i18n.TRANSLATIONS = TRANSLATIONS;
    }

    // init
    document.addEventListener('DOMContentLoaded', () => {
        const selector = document.getElementById('langSelector');
        if (selector) {
            selector.value = 'en';
            selector.addEventListener('change', (e) => translateAll(e.target.value));
        }
        translateAll('en');
    });
})();
