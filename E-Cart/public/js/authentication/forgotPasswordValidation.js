const emailInput = document.getElementById('email');
const email_err_small = document.getElementById('email-err');

emailInput.addEventListener('input', () => {
    if (emailInput.value.length > 0) {
        for_valid(emailInput, email_err_small);
    } else {
        let err_msg = "Required!";
        for_invalid(emailInput, email_err_small, err_msg);
    }
})

document.forms['auth-form'].onsubmit = (e) => {
    if (emailInput.value.length < 1) {
        e.preventDefault();
        let err_msg = "Required!";
        for_invalid(emailInput, email_err_small, err_msg);
    } else {
        return true;
    }
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