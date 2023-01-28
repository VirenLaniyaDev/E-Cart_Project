const profileImageInput = document.getElementById('change-profile-img');
profileImageInput.addEventListener('change',(event)=>{
    var profilePicture = document.getElementById('profile-picture');
    profilePicture.src = URL.createObjectURL(event.target.files[0]);
});

let email_err = false;
let address_err = false;
let mobile_err = false;

//// On changing name
const userNameInput = document.getElementById('user-name');
const userNameError = document.getElementById('user-name-err');
const profileName = document.getElementsByClassName('profile-name')[0];
userNameInput.addEventListener('input', () => {
    profileName.innerHTML = userNameInput.value;
    if (userNameInput.value.length > 0) {
        for_valid(userNameInput, userNameError);
    }
});

//--- Email validation
const userEmail = document.getElementById('user-email');
const userEmail_err_small = document.getElementById('user-email-err');
userEmail.addEventListener('input', () => {
    let regex_email = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if (regex_email.test(userEmail.value)) {
        email_err = false;
        for_valid(userEmail, userEmail_err_small);
    } else {
        email_err = true;
        let err_msg = "Invalid email!";
        for_invalid(userEmail, userEmail_err_small, err_msg);
    }
})

// Mobile
const userMobile = document.getElementById('user-mobile');
const userMobile_err_small = document.getElementById('user-mobile-err');
userMobile.addEventListener('input', () => {
    let regex_mobile = /^[0-9]{10}$/;
    if (regex_mobile.test(userMobile.value)) {
        mobile_err = false;
        for_valid(userMobile, userMobile_err_small);
    } else {
        mobile_err = true;
        let err_msg = "Mobile number should be 10 digits!";
        for_invalid(userMobile, userMobile_err_small, err_msg);
    }
});

// Address
const address = document.getElementById('address');
const address_err_small = document.getElementById('address-err');
address.addEventListener('input', () => {
    if(address.value.trim().length < 15){
        address_err = true;
        let err_msg = "Address should contain atleast 15 characters!";
        for_invalid(address, address_err_small, err_msg);
    } else {
        address_err = false;
        for_valid(address, address_err_small);
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

        resolve();
    })

    requiredPromise
        .then(() => {
            //// If any one error becomes true then form will not submitted
            if (!(address_err || email_err || mobile_err || required_err)) {
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
