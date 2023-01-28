// Set limit of characters in product titles
const productTitles = document.querySelectorAll('.product-title');
const maxChar = 85;
productTitles.forEach(productTitle => {
    if (productTitle.textContent.length > maxChar) {
        productTitle.textContent = productTitle.textContent.slice(0, maxChar) + "...";
    }
})

// Customer info btn
const infoBtns = document.querySelectorAll('.i-btn');
const customerInfos = document.querySelectorAll('.customer-info');
for (let i = 0; i < infoBtns.length; i++) {
    infoBtns[i].addEventListener('click', (event) => {
        customerInfos[i].classList.toggle('d-none');
        event.preventDefault();
    })
}

// Order request page
const shipOrderForms = document.getElementsByClassName('ship-order-form');
for (let i = 0; i < shipOrderForms.length; i++) {
    confirmShipping(shipOrderForms[i]);
}

// Function for confirm shipping
function confirmShipping(formElement) {
    formElement.addEventListener('submit', (event) => {
        console.log("Executed!");
        let confirm_msg = "Order is go for shipping!...";
        if (confirm(confirm_msg)) {
            return true;
        } else {
            event.preventDefault();
        }
    })
}