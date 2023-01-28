//--- On input for email and password field : When required error is comes to remove that error on input
// Email
const email = document.getElementById('email');
const email_err_small = document.getElementById('email-err');
email.addEventListener('input', () => {
    if (email.value.length > 0) {
        for_valid(email, email_err_small);
    }
})
// Password
const password = document.getElementById('password');
const password_err_small = document.getElementById('password-err');
password.addEventListener('input', () => {
    if (password.value.length > 0) {
        for_valid(password, password_err_small);
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
        resolve();
    })

    requiredPromise
        .then(() => {
            // If any one error becomes true then form will not submitted
            if (!required_err) {
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