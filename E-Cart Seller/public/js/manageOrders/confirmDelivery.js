const otpInput = document.getElementById('otp');
const otpErrorSmall = document.getElementById('otp-err');

otpInput.addEventListener('input', () => {
    if (otpInput.value.length > 0) {
        for_valid(otpInput, otpErrorSmall);
    }
})

let otpValid = false;
document.forms['confirm-delivery-form'].onsubmit = (event) => {
    if (otpInput.value.length <= 0) {
        let err_msg = "Required!";
        for_invalid(otpInput, otpErrorSmall, err_msg);
        event.preventDefault();
    } else if (otpValid) {
        return true;
    } else {
        makeAJAXRequest('POST', '/verify-otp', verifyOTP);
        event.preventDefault();
    }
}

// Function for Make AJAX Request 
function makeAJAXRequest(method, url, callback) {

    let xhr = new XMLHttpRequest();     // Make object of XMLHttpRequest()
    xhr.open(method, url);    // Open() specifies request type and URL
    xhr.setRequestHeader('Accept', 'application/json'); // Set header - Accept indicates output in JSON
    xhr.setRequestHeader('Content-Type', 'application/json');   // Set header - Content-Type that indicates request body is in JSON

    // When response is ready
    xhr.onreadystatechange = function () {
        // Ready states
        // 0	UNSENT	            Client has been created. open() not called yet.
        // 1	OPENED	            open() has been called.
        // 2	HEADERS_RECEIVED	send() has been called, and headers and status are available.
        // 3	LOADING	            Downloading; responseText holds partial data.
        // 4	DONE	            The operation is complete.
        if (xhr.readyState === 4 && xhr.status === 200) {
            callback(xhr.response);
        }
    }

    xhr.send(); // Sends the request
}

// After getting response of AJAX request we verify the OTP
function verifyOTP(data) {
    let _data = JSON.parse(data);
    if (_data.status == true) {
        // If input value and response OTP value matches
        if (otpInput.value == _data.OTP) {  
            otpValid = true;
            document.forms['confirm-delivery-form'].submit();
        } else {    // Otherwise Invalid OTP and form will not submit
            otpValid = false;
            let err_msg = "Invalid OTP!";
            for_invalid(otpInput, otpErrorSmall, err_msg);
        }
    } else {    // for status : false - OTP expires!
        otpValid = false;
        let err_msg = "OTP expires! Please click on Resend.";
        for_invalid(otpInput, otpErrorSmall, err_msg);
    }
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