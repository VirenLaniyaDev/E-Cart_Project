//// Input field validation ////
// For Mobile
let mobile_err = false;
const mobileInputField = document.getElementById('mobile_inputField');
const mobile_err_small = document.getElementById('mobile-err');
mobileInputField.addEventListener('input', () => {
    let regex_mobile = /^[0-9]{10}$/;
    if (regex_mobile.test(mobileInputField.value)) {
        mobile_err = false;
        for_valid(mobileInputField, mobile_err_small);
    } else {
        mobile_err = true;
        let err_msg = "Mobile should contains 10 digits!";
        for_invalid(mobileInputField, mobile_err_small, err_msg);
    }
})

document.forms['changeMobile-form'].onsubmit = (e)=>{
    let required_err = false;
    if(mobileInputField.value.length <= 0){
        required_err = true;
        let err_msg = "Required!";
        for_invalid(mobileInputField, mobile_err_small, err_msg);
    } 
    if(!(mobile_err || required_err)){
        return true;
    } else {
        e.preventDefault();
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

//// Order items ////
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


//// Handling step wise confirmation ////
const mobileContainer = document.querySelector('.mobile-container');
const deliveryAddContainer = document.querySelector('.delivery-address-container');
const orderSummaryContainer = document.querySelector('.order-summary-container');
const paymentOptionContainer = document.querySelector('.payment-option-container');

disabled(deliveryAddContainer);
disabled(orderSummaryContainer);
disabled(paymentOptionContainer);

// 1. During Mobile is verification
const mobile = document.querySelector('.mobile');
const changeMobileBtnBox = document.getElementById('changeMobile-btnBox');
const changeMobileBtn = document.getElementById('change-mobile-btn');
const changeMobileForm = document.getElementById('change-mobile-form');
const cancelMobileBtn = document.getElementById('cancel-mobile-btn');

if (mobile.textContent.length != 0) {
    verified(document.querySelector('.mobile-container .status'));
    enabled(deliveryAddContainer);
} else {
    changeMobile_display();
    mobileInputField.focus();
}

changeMobileBtn?.addEventListener('click', () => {
    changeMobile_display();
})

cancelMobileBtn?.addEventListener('click', () => {
    changeMobileForm.classList.add('d-none');
    changeMobileBtnBox.classList.remove('d-none');
})

function changeMobile_display() {
    changeMobileForm.classList.remove('d-none');
    changeMobileBtnBox.classList.add('d-none');
}

// 2. During Delivery address verification
const address = document.querySelector('.address');
const changeAddressBtnBox = document.getElementById('changeAddress-btnBox');
const changeAddressBtn = document.getElementById('change-add-btn');
const changeAddressForm = document.getElementById('change-address-form');
const cancelAddressBtn = document.getElementById('cancel-address-btn');
const deliverAndContinueBtn = document.getElementById('deliverAndContinue-btn');

if (address.textContent.length == 0) {
    changeAddress_display();
    deliveryAddressTextarea.focus();
}

changeAddressBtn?.addEventListener('click', () => {
    changeAddress_display();
    deliveryAddressTextarea.focus();
})

cancelAddressBtn?.addEventListener('click', () => {
    changeAddressForm.classList.add('d-none');
    changeAddressBtnBox.classList.remove('d-none');
    deliverAndContinueBtn.style.display = "block";
})

deliverAndContinueBtn.addEventListener('click', () => {
    enabled(orderSummaryContainer);
    verified(document.querySelector('.delivery-address-container .status'));
    orderSummaryContainer.click();
    deliverAndContinueBtn.style.display = "none";
})

function changeAddress_display() {
    changeAddressForm.classList.remove('d-none');
    changeAddressBtnBox.classList.add('d-none');
    deliveryAddressTextarea.focus();
    deliverAndContinueBtn.style.display = "none";
}

// 3. During Order summary verification
const cartItemWrapper = document.querySelector('.cart-items-wrapper');
orderSummaryContainer.addEventListener('click', () => {
    orderSummaryContainer.classList.toggle('summary-focused');
    cartItemWrapper.classList.toggle("d-none");
})

const orderReviewedContBtn = document.getElementById('orderReviewed-btn');
orderReviewedContBtn.addEventListener('click', () => {
    enabled(paymentOptionContainer);
    verified(document.querySelector('.order-summary-container .status'));
    orderSummaryContainer.click();
})

// 4. While payment option is gets selected
const paymentOptions = document.getElementsByName('paymentOption');
const inputPaymentMethod = document.getElementById('inputPaymentMethod');
let paymentOptValue;
paymentOptions.forEach(paymentOption => {
    paymentOption.addEventListener('change', () => {
        if (paymentOption.checked) {
            paymentOptValue = paymentOption.value;
            inputPaymentMethod.value = paymentOptValue;
            verified(document.querySelector('.payment-option-container .status'));
            allVerified();
        }
    })
})

// Helping functions
function disabled(element) {
    element.style.pointerEvents = "none";
    element.style.filter = "opacity(0.8)";
}

function enabled(element) {
    element.style.pointerEvents = "all";
    element.style.filter = "none";
}

function verified(element) {
    element.innerHTML = "&#x2714";
    element.classList.add('verified');
}

// When all fields are verified
const verificationGuide = document.querySelector('.verification-guide');
const placeOrderBtn = document.querySelector('.placeOrder-btn');
function allVerified() {
    verificationGuide.innerHTML = "Well done! Now you can place your order";
    verificationGuide.style.color = "var(--success-clr)";
    placeOrderBtn.classList.remove('d-none');
}