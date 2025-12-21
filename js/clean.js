// Clears the form values
function clean() {
    let $ = document.querySelector.bind(document);
    $("#skein-weight").value = "";
    $("#skein-price").value = "";
    $("#finished-weight").value = "";
    $("#hour-rate").value = "";
    $("#hours-worked").value = "";
    $("#profit-margin").value = "";
    $("#description").value = "";
    $("#result").innerHTML = "";
    $("#table-result").innerHTML = "";
    $("#ovrd-save-pdf").classList.add("is-hidden");
    $("#ovrd-copy").classList.add("is-hidden");
}
