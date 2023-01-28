let password_err = false;
let confPassword_err = false;

//--- Password validation
const newPassword = document.getElementById('new_password');
const newPassword_err_small = document.getElementById('new_password-err');
newPassword.addEventListener('input', () => {

    if (newPassword.value.length < 6) {
        password_err = true;
        let err_msg = "Password at least 6 character long!";
        for_invalid(newPassword, newPassword_err_small, err_msg);
    } else {
        password_err = false;
        for_valid(newPassword, newPassword_err_small);
    }
})

//--- Confirm password
const confirmPassword = document.getElementById('confirm_password');
const confirmPassword_err_small = document.getElementById('confirm_password-err');
// During input
confirmPassword.addEventListener('input', () => {
    let password_str = newPassword.value;
    let confPassword_str = confirmPassword.value;
    // If input field is empty 
    if (confPassword_str.length == 0 && password_str.length > 0) {
        confPassword_err = true;
        let err_msg = "Please re-type password!";
        for_invalid(confirmPassword, confirmPassword_err_small, err_msg);
    } else if (confPassword_str !== password_str) {
        confPassword_err = true;
        let err_msg = "Both password should be same!";
        for_invalid(confirmPassword, confirmPassword_err_small, err_msg);
    } else {
        confPassword_err = false;
        for_valid(confirmPassword, confirmPassword_err_small);
    }
})

document.forms['auth-form'].onsubmit = (e) => {
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
        resolve();
    })

    requiredPromise
        .then(() => {
            // If any one error becomes true then form will not submitted
            if (!(confPassword_err || password_err || required_err)) {
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
    err_msg_element.style.visibility = "visible";
    element.classList.add("invalid");
}

function for_valid(element, err_msg_element) {
    err_msg_element.style.visibility = "hidden";
    element.classList.remove("invalid");
}