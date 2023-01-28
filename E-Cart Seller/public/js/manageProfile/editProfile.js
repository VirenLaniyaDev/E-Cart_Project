const profileImageInput = document.getElementById('change-profile-img');
profileImageInput.addEventListener('change',(event)=>{
    var profilePicture = document.getElementById('profile-picture');
    profilePicture.src = URL.createObjectURL(event.target.files[0]);
});

let email_err = false;
let mobile_err = false;

//// On changing name
const sellerNameInput = document.getElementById('seller-name');
const sellerNameError = document.getElementById('seller-name-err');
const profileName = document.getElementsByClassName('profile-name')[0];
sellerNameInput.addEventListener('input', () => {
    profileName.innerHTML = sellerNameInput.value;
    if (sellerNameInput.value.length > 0) {
        for_valid(sellerNameInput, sellerNameError);
    }
});

//--- Email validation
const sellerEmail = document.getElementById('seller-email');
const sellerEmail_err_small = document.getElementById('seller-email-err');
sellerEmail.addEventListener('input', () => {
    let regex_email = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if (regex_email.test(sellerEmail.value)) {
        email_err = false;
        for_valid(sellerEmail, sellerEmail_err_small);
    } else {
        email_err = true;
        let err_msg = "Invalid email!";
        for_invalid(sellerEmail, sellerEmail_err_small, err_msg);
    }
})

// Mobile
const sellerMobile = document.getElementById('seller-mobile');
const sellerMobile_err_small = document.getElementById('seller-mobile-err');
sellerMobile.addEventListener('input', () => {
    let regex_mobile = /^[0-9]{10}$/;
    if (regex_mobile.test(sellerMobile.value)) {
        mobile_err = false;
        for_valid(sellerMobile, sellerMobile_err_small);
    } else {
        mobile_err = true;
        let err_msg = "Mobile number should be 10 digits!";
        for_invalid(sellerMobile, sellerMobile_err_small, err_msg);
    }
});

// Business Name
const businessName = document.getElementById('business-name');
const businessName_err_small = document.getElementById('business-name-err');
businessName.addEventListener('input', () => {
    if (businessName.value.length > 0) {
        for_valid(businessName, businessName_err_small);
    }
});

// GSTIN
const businessGSTIN = document.getElementById('business-gstin');
const businessGSTIN_err_small = document.getElementById('business-gstin-err');
businessGSTIN.addEventListener('input', () => {
    if (businessGSTIN.value.length > 0) {
        for_valid(businessGSTIN, businessGSTIN_err_small);
    }
});

// Business Address
const businessAddress = document.getElementById('business_address');
const businessAddress_err_small = document.getElementById('business_address-err');
businessAddress.addEventListener('input', () => {
    if (businessAddress.value.length > 0) {
        for_valid(businessAddress, businessAddress_err_small);
    }
});

// Bank name
const bankName = document.getElementById('bank-name');
const bankName_err_small = document.getElementById('bank-name-err');
bankName.addEventListener('input', () => {
    if (bankName.value.length > 0) {
        for_valid(bankName, bankName_err_small);
    }
});

// Bank Account
const bankAccount = document.getElementById('bank-account');
const bankAccount_err_small = document.getElementById('bank-account-err');
bankAccount.addEventListener('input', () => {
    if (bankAccount.value.length > 0) {
        for_valid(bankAccount, bankAccount_err_small);
    }
});

// Bank IFSC
const bankIFSC = document.getElementById('bank-ifsc');
const bankIFSC_err_small = document.getElementById('bank-ifsc-err');
bankIFSC.addEventListener('input', () => {
    if (bankIFSC.value.length > 0) {
        for_valid(bankIFSC, bankIFSC_err_small);
    }
});



//--- On form submit
document.forms['editProfile-form'].onsubmit = (e) => {
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
        // for textarea
        const business_address = document.getElementById('business_address');
        const business_address_err_small = document.getElementById('business_address-err');
        if (business_address.value == "") {
            required_err = true;
            let err_msg = "Required!";
            for_invalid(business_address, business_address_err_small, err_msg);
        }

        resolve();
    })

    requiredPromise
        .then(() => {
            //// If any one error becomes true then form will not submitted
            if (!(email_err || mobile_err || required_err)) {
                console.log("Form submitted!");
                return true;
            } else {
                console.log("Form is not submitted!");
                e.preventDefault();
            }
        })
}

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
