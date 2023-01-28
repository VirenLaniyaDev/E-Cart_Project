let email_err = false;
let mobile_err = false;
let password_err = false;
let confPassword_err = false;

//--- On input for seller name and business name field : When required error is comes to remove that error on input
// Seller name
const sname = document.getElementById('sname');
const sname_err_small = document.getElementById('sname-err');
sname.addEventListener('input', () => {
    if (sname.value.length > 0) {
        for_valid(sname, sname_err_small);
    }
});
// Business name
const bname = document.getElementById('bname');
const bname_err_small = document.getElementById('bname-err');
bname.addEventListener('input', () => {
    console.log(bname.value.toString());
    if (bname.value.length > 0) {
        for_valid(bname, bname_err_small);
    }
});

//--- Email validation
const email = document.getElementById('email');
const email_err_small = document.getElementById('email-err');
email.addEventListener('input', () => {
    let regex_email = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if (regex_email.test(email.value)) {
        email_err = false;
        for_valid(email, email_err_small);
    } else {
        email_err = true;
        let err_msg = "Invalid email!";
        for_invalid(email, email_err_small, err_msg);
    }
})

//--- Mobile validation
const mobile = document.getElementById('mobile');
const mobile_err_small = document.getElementById('mobile-err');
mobile.addEventListener('input', () => {
    let regex_mobile = /^[0-9]{10}$/;
    if (regex_mobile.test(mobile.value)) {
        mobile_err = false;
        for_valid(mobile, mobile_err_small);
    } else {
        mobile_err = true;
        let err_msg = "Mobile number should be 10 digits!";
        for_invalid(mobile, mobile_err_small, err_msg);
    }
})

//--- Password validation
const password = document.getElementById('password');
const password_err_small = document.getElementById('password-err');
password.addEventListener('input', () => {
    if (password.value.length < 6) {
        password_err = true;
        let err_msg = "Password at least 6 character long!";
        for_invalid(password, password_err_small, err_msg);
    } else {
        password_err = false;
        for_valid(password, password_err_small);
    }
})

//--- Confirm password
const confirm_password = document.getElementById('confPassword');
const confPassword_err_small = document.getElementById('confPass-err');
// During input
confirm_password.addEventListener('input', () => {
    let password_str = password.value;
    let confPassword_str = confirm_password.value;
    // If input field is empty 
    if (confPassword_str.length == 0 && password_str.length > 0) {
        confPassword_err = true;
        let err_msg = "Please re-type password!";
        for_invalid(confirm_password, confPassword_err_small, err_msg);
    } else {
        confPassword_err = false;
        for_valid(confirm_password, confPassword_err_small);
    }
})
// After focus over
confirm_password.addEventListener('blur', () => {
    let password_str = password.value;
    let confPassword_str = confirm_password.value;
    // If password does not match
    if (confPassword_str === password_str) {
        confPassword_err = false;
        for_valid(confirm_password, confPassword_err_small);
    } else {
        confPassword_err = true;
        let err_msg = "Both password should be same!";
        for_invalid(confirm_password, confPassword_err_small, err_msg);
    }
})

//--- On check
const agreement = document.getElementById('agreement');
agreement.addEventListener('change', () => {
    if (agreement.checked == true) {
        const termsConditions = document.getElementById('terms-conditions');
        termsConditions.style.color = "var(--primary-clr)";
    }
})

//--- On form submit
document.forms['auth-form'].onsubmit = (err) => {
    let required_err = false;   // Initially required error is false.

    const requiredPromise = new Promise((resolve) => {
        const inputFields = document.querySelectorAll('.input-container input');
        // Checking for required field first 
        inputFields.forEach(inputField => {
            const inputField_err_small = inputField.previousElementSibling; // Getting 'small' which is sibling of 'input'
            let err_msg = "Required!";
            if (inputField.value.toString() === "") {
                required_err = true;
                for_invalid(inputField, inputField_err_small, err_msg);
            }
        });
        // Agreement
        const agreement = document.getElementById('agreement');
        if (agreement.checked == false) {
            required_err = true;
            const termsConditions = document.getElementById('terms-conditions');
            termsConditions.style.color = "var(--danger-clr)";
        }
        resolve();
    })

    requiredPromise
        .then(() => {
            // If any one error becomes true then form will not submitted
            if (!(email_err || mobile_err || password_err || confPassword_err || required_err)) {
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