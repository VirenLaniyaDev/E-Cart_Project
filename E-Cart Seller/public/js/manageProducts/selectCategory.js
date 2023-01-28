const prod_categories = document.getElementById("prod_categories");
const prod_subCategories_container = document.getElementById("prod_subCategories-container");
const prod_subCategories = document.getElementById('prod_subCategories');
// Sub categories arrays
const electronics_optionArr = ["laptop|Laptop", "camera|Camera", "headphonesEarbuds|Headphones or Earbuds", "mobileAcc|Mobile Accessories"];
const fashion_optionArr = ["topWear|Top wear", "bottomWear|Bottom wear", "westerns|Westerns", "blazers|Blazers", "watches|Watches", "shoes|Shoes"];

const subCategory = prod_subCategories.dataset.subcategory;

selectSubcategory();
function selectSubcategory() {
    prod_subCategories_container.classList.add('d-none');
    if (prod_categories.value == "electronics") {
        selectSubcategoryOption(electronics_optionArr);
    }
    else if (prod_categories.value == "fashion") {
        selectSubcategoryOption(fashion_optionArr);
    }
}

function selectSubcategoryOption(optionsArray) {
    let subCategory_promise = new Promise((resolve) => {
        addOptions(optionsArray);   // 1. Adding options
        resolve();
    })
    subCategory_promise
        .then(() => {
            // 2. Selecting sub category that is stored in database  
            // Sub category stored in database
            let options = document.querySelectorAll('#prod_subCategories option');
            options.forEach(option => {
                if (option.value == subCategory) {
                    option.setAttribute("selected", true);
                }
            })
        })
}

// On change category selection
prod_categories.addEventListener('change', () => {
    prod_subCategories.innerHTML = "";
    prod_subCategories_container.classList.add('d-none');
    if (prod_categories.value == "electronics") {
        addOptions(electronics_optionArr);
    }
    else if (prod_categories.value == "fashion") {
        addOptions(fashion_optionArr);
    }
})

// Adding option in select according category selected
function addOptions(optionArray) {
    prod_subCategories_container.classList.remove('d-none');
    optionArray.forEach(option => {
        let pair = option.split("|");
        const newOption = document.createElement('option');
        newOption.value = pair[0];
        newOption.innerHTML = pair[1];
        prod_subCategories.appendChild(newOption);
    });
}