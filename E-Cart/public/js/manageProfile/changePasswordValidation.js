const inputFields = document.querySelectorAll('.input-container input');

// valid on input 
inputFields.forEach(inputField => {
    const inputField_err_small = inputField.previousElementSibling; // Getting 'small' which is sibling of 'input'
    inputField.addEventListener('input', () => {
        validOnInput(inputField, inputField_err_small);
    })
});

// Password validation
let newPass_err = false;
let confirmPass_err = false;


const oldPassword = document.getElementById("old_password");
const newPassword = document.getElementById("new_password");
const newPassword_err_small = document.getElementById("new_password-err");
const confirmPassword = document.getElementById("confirm_password");
const confirmPassword_err_small = document.getElementById("confirm_password-err");

oldPassword.addEventListener('input', () => {
    if ((oldPassword.value === newPassword.value) && (newPassword.value.length > 0)) {
        newPass_err = true;
        let err_msg = "Old and New password should not be same!";
        for_invalid(newPassword, newPassword_err_small, err_msg);
    } else {
        newPass_err = false;
        for_valid(newPassword, newPassword_err_small);
    }
})

newPassword.addEventListener('input', () => {
    if (newPassword.value.length < 6) {
        newPass_err = true;
        let err_msg = "Password at least 6 character long!";
        for_invalid(newPassword, newPassword_err_small, err_msg);
    } else {
        newPass_err = false;
        for_valid(newPassword, newPassword_err_small);
    }
})

newPassword.addEventListener('blur', () => {
    if (oldPassword.value === newPassword.value) {
        newPass_err = true;
        let err_msg = "Old and New password should not be same!";
        for_invalid(newPassword, newPassword_err_small, err_msg);
    }
    else if ((newPassword.value !== confirmPassword.value) && confirmPassword.value.length > 0) {
        let err_msg = "Both password must be same!"
        for_invalid(confirmPassword, confirmPassword_err_small, err_msg);
    }
    else {
        for_valid(confirmPassword, confirmPassword_err_small);
    }
})

confirmPassword.addEventListener('input', () => {
    if (newPassword.value !== confirmPassword.value) {
        let err_msg = "Both password must be same!"
        for_invalid(confirmPassword, confirmPassword_err_small, err_msg)
    } else {
        for_valid(confirmPassword, confirmPassword_err_small);
    }
})


//--- On form submit
document.forms['changePassword-form'].onsubmit = (e) => {
    let required_err = false;   // Initially required error is false.

    const requiredPromise = new Promise((resolve) => {
        //// Checking for required field first 
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
            //// If any one error becomes true then form will not submitted
            if (!(newPass_err || confirmPass_err || required_err)) {
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

function validOnInput(element, err_msg_element) {
    if (element.value.length > 0) {
        for_valid(element, err_msg_element);
    }
}