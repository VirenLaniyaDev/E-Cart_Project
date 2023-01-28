// Set limit of characters in product titles
const productTitles = document.querySelectorAll('.product-title');
const maxChar = 85;
productTitles.forEach(productTitle => {
    if (productTitle.textContent.length > maxChar) {
        productTitle.textContent = productTitle.textContent.slice(0, maxChar) + "...";
    }
})

// If product quantity is 1 then it can not decrement, making decrement button disable while quantity is 1
const productQuantities = document.querySelectorAll('.quantity-box .quantity');
const decrementBtns = document.querySelectorAll('.quantity-box .decrement-qnt');
for (let i = 0; i < productQuantities.length; i++) {
    if (+productQuantities[i].textContent <= 1) {
        decrementBtns[i].disabled = true;
    }
}

// For address
const deliveryAddressTextarea = document.getElementById('delivery_address-textarea');
const address_err_small = document.getElementById('delivery_address-err');
document.forms['changeAdd-form'].onsubmit = (e)=>{
    let required_err = false;
    let address_err = false;
    if(deliveryAddressTextarea.value.length <= 0){
        required_err = true;
        let err_msg = "Required!";
        for_invalid(deliveryAddressTextarea, address_err_small, err_msg);
    } else if(deliveryAddressTextarea.value.length < 15){
        address_err = true;
        let err_msg = "Address should contain atleast 15 characters!";
        for_invalid(deliveryAddressTextarea, address_err_small, err_msg);
    }
    if(!(address_err || required_err)){
        return true;
    } else {
        e.preventDefault();
    }
}

deliveryAddressTextarea.addEventListener('input',()=>{
    for_valid(deliveryAddressTextarea, address_err_small);
});

//--- Helper functions
function for_invalid(element, err_msg_element, err_msg) {
    err_msg_element.innerText = err_msg;
    err_msg_element.style.display = "block";
    element.classList.add("invalid");
}

function for_valid(element, err_msg_element) {
    err_msg_element.style.display = "none";
    element.classList.remove("invalid");
}

//// Address container ////
const changeAddressBtn = document.getElementById('change-add-btn');
const changeAddressForm = document.querySelector('.change-add-form');
const changeAddress = document.querySelector('.change-address');

changeAddressBtn.addEventListener('click', () => {
    changeAddressForm.classList.remove('d-none');
    changeAddress.classList.add('d-none');
    deliveryAddressTextarea.focus();
})

const cancelBtn = document.querySelector('.cancel-btn');
cancelBtn.addEventListener('click', () => {
    changeAddressForm.classList.add('d-none');
    changeAddress.classList.remove('d-none');
})