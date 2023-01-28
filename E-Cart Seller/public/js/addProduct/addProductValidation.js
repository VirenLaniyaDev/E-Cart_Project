let mrp_err = false;
let sellingPrice_err = false;
let quantity_err = false;
let delivery_err = false;

//--- On input for fields
// Product title
const prod_title = document.getElementById('prod_title');
const prod_title_err_small = document.getElementById('prod_title-err');
prod_title.addEventListener('input', () => {
    if (prod_title.value.length > 0) {
        for_valid(prod_title, prod_title_err_small);
    }
})

// Product Categories
// const prod_categories = document.getElementById('prod_categories');  // Already Declared in other script file
const prod_categories_err_small = document.getElementById('prod_categories-err');
prod_categories.addEventListener('change', () => {
    if (prod_categories.value != "select") {
        for_valid(prod_categories, prod_categories_err_small);
    }
})

// Product MRP 
const prod_mrp = document.getElementById('prod_mrp');
const prod_mrp_err_small = document.getElementById('prod_mrp-err');
const prod_sellingPrice = document.getElementById('prod_sellingPrice');
const prod_sellingPrice_err_small = document.getElementById('prod_sellingPrice-err');
prod_mrp.addEventListener('input', () => {
    let mrp = +(prod_mrp.value);
    let sellingPrice = +(prod_sellingPrice.value);
    if (mrp < 0) {
        mrp_err = true;
        let err_msg = "Price must be positive value!";
        for_invalid(prod_mrp, prod_mrp_err_small, err_msg);
    }
    else if (sellingPrice > mrp) {
        sellingPrice_err = true;
        let err_msg = "Selling price must be less then MRP!";
        for_invalid(prod_sellingPrice, prod_sellingPrice_err_small, err_msg);
    }
    else {
        mrp_err = false;
        for_valid(prod_mrp, prod_mrp_err_small);
    }
    if (sellingPrice < mrp && prod_sellingPrice.value.toString() !== "") {
        sellingPrice_err = false;
        for_valid(prod_sellingPrice, prod_sellingPrice_err_small);
    }
})
// Product selling price
prod_sellingPrice.addEventListener('input', () => {
    let mrp = +(prod_mrp.value);
    let sellingPrice = +(prod_sellingPrice.value);
    if (sellingPrice < 0) {
        sellingPrice_err = true;
        let err_msg = "Price must be positive value!";
        for_invalid(prod_sellingPrice, prod_sellingPrice_err_small, err_msg);
    }
    else if (sellingPrice > mrp) {
        sellingPrice_err = true;
        let err_msg = "Selling price must be less then MRP!";
        for_invalid(prod_sellingPrice, prod_sellingPrice_err_small, err_msg);
    }
    else if (sellingPrice < mrp) {
        sellingPrice_err = false;
        for_valid(prod_sellingPrice, prod_sellingPrice_err_small);
    }
    else {
        sellingPrice_err = false;
        for_valid(prod_sellingPrice, prod_sellingPrice_err_small);
    }
})

// Product quantity
const prod_quantity = document.getElementById('prod_quantity');
const prod_quantity_err_small = document.getElementById('prod_quantity-err');
prod_quantity.addEventListener('input', () => {
    if (+(prod_quantity.value) < 1) {
        quantity_err = true;
        let err_msg = "Quantity must be more than 0!"
        for_invalid(prod_quantity, prod_quantity_err_small, err_msg);
    } else {
        quantity_err = false;
        for_valid(prod_quantity, prod_quantity_err_small);
    }
})

// Product Image
const prod_image = document.getElementById('prod_image');  // Already Declared in other script file
const prod_image_err_small = document.getElementById('prod_image-err');
prod_image.addEventListener('change', () => {
    if (prod_image.value != "") {
        for_valid(prod_image, prod_image_err_small);
    }
})

// Product delivery within
const prod_delivery = document.getElementById('prod_delivery');
const product_delivery_err_small = document.getElementById('prod_delivery-err');
prod_delivery.addEventListener('input', () => {
    if (prod_delivery.value.trim().length > 0) {
        if ((+prod_delivery.value) > 10 || (+prod_delivery.value) < 1) {
            delivery_err = true;
            let err_msg = "Delivery days must be within 0 to 10 days!";
            for_invalid(prod_delivery, product_delivery_err_small, err_msg);
        } else {
            delivery_err = false;
            for_valid(prod_delivery, product_delivery_err_small);
        }
    }
})

// Product Description
const prod_description = document.getElementById('prod_description');  // Already Declared in other script file
const prod_description_err_small = document.getElementById('prod_description-err');
prod_description.addEventListener('input', () => {
    if (prod_description.value != "") {
        for_valid(prod_description, prod_description_err_small);
    }
})

//--- On form submit
document.forms['addProduct-form'].onsubmit = (err) => {
    let required_err = false;   // Initially required error is false.

    const requiredPromise = new Promise((resolve) => {
        const inputFields = document.querySelectorAll('.input-container input');
        //// Checking for required field first 
        inputFields.forEach(inputField => {
            const inputField_err_small = inputField.previousElementSibling; // Getting 'small' which is sibling of 'input'
            let err_msg = "Required!";
            if (inputField.value.toString() === "") {
                required_err = true;
                for_invalid(inputField, inputField_err_small, err_msg);
            }
        });
        // for select
        const prod_categories = document.getElementById('prod_categories');
        const prod_categories_err_small = document.getElementById('prod_categories-err');
        if (prod_categories.value == "select") {
            required_err = true;
            let err_msg = "Required!";
            for_invalid(prod_categories, prod_categories_err_small, err_msg);
        }
        // for textarea
        const prod_description = document.getElementById('prod_description');
        const prod_description_err_small = document.getElementById('prod_description-err');
        if (prod_description.value == "") {
            required_err = true;
            let err_msg = "Required!";
            for_invalid(prod_description, prod_description_err_small, err_msg);
        }

        resolve();
    })

    requiredPromise
        .then(() => {
            //// If any one error becomes true then form will not submitted
            if (!(mrp_err || sellingPrice_err || quantity_err || delivery_err || required_err)) {
                console.log("Form submitted!");
                return true;
            } else {
                console.log("Form is not submitted!");
                err.preventDefault();
            }
        })
}

//--- Helper functions
function for_invalid(element, err_msg_element, err_msg) {
    err_msg_element.innerText = err_msg;
    err_msg_element.style.visibility = "visible";
    element.classList.add("invalid");
}

function for_valid(element, err_msg_element) {
    err_msg_element.style.visibility = "hidden";
    element.classList.remove("invalid");
}