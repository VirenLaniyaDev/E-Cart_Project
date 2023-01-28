///// Filter toggling /////
const filterBtn = document.querySelector('.filter-btn');
const filterBox = document.querySelector('.search-results-filters');
filterBtn?.addEventListener('click', () => {
    filterBox.classList.toggle('d-block');
});

// Slicing line if line contains more then specified length of char
let maxLengthOfChar = 90;
const productTitles = document.querySelectorAll(".product-title");
productTitles?.forEach(productTitle => {
    if (productTitle.textContent.length > maxLengthOfChar) {
        productTitle.textContent = productTitle.textContent.slice(0, maxLengthOfChar) + "...";
    }
})

const filterRating = document.querySelector('.rating-filter')?.dataset.filterRating;
if (filterRating) {
    const ratingFilterCheckboxes = document.getElementsByName('rating_filter');
    ratingFilterCheckboxes.forEach(ratingFilterCheckbox => {
        if (+ratingFilterCheckbox.value >= filterRating) {
            ratingFilterCheckbox.checked = true;
        }
    })
}