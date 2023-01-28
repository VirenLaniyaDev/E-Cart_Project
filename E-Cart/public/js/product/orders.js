// Set limit of characters in product titles
const productTitles = document.querySelectorAll('.product-title');
const maxChar = 85;
productTitles.forEach(productTitle => {
    if (productTitle.textContent.length > maxChar) {
        productTitle.textContent = productTitle.textContent.slice(0, maxChar) + "...";
    }
})