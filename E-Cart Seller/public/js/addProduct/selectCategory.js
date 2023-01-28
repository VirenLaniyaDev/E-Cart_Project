const prod_categories = document.getElementById("prod_categories");
const prod_subCategories_container = document.getElementById("prod_subCategories-container");
prod_categories.addEventListener('change', () => {
    prod_subCategories.innerHTML = "";
    prod_subCategories_container.classList.add('d-none');
    if (prod_categories.value == "electronics") {
        const electronics_optionArr = ["laptop|Laptop", "camera|Camera", "headphonesEarbuds|Headphones or Earbuds", "mobileAcc|Mobile Accessories"];
        addOptions(electronics_optionArr);
    }
    else if (prod_categories.value == "fashion") {
        const fashion_optionArr = ["topWear|Top wear", "bottomWear|Bottom wear", "westerns|Westerns", "blazers|Blazers", "watches|Watches", "shoes|Shoes"];
        addOptions(fashion_optionArr);
    }
})

function addOptions(optionArray) {
    const prod_subCategories = document.getElementById('prod_subCategories');
    prod_subCategories_container.classList.remove('d-none');
    optionArray.forEach(option => {
        let pair = option.split("|");
        const newOption = document.createElement('option');
        newOption.value = pair[0];
        newOption.innerHTML = pair[1];
        prod_subCategories.appendChild(newOption);
    });
}