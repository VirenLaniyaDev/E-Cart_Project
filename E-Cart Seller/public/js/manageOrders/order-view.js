const orderTracking = document.getElementsByClassName('order-tracking');
const orderTrackingContainer = document.querySelector('.order-tracking-container');
const orderStatus = orderTrackingContainer.dataset.orderStatus;

if (orderStatus === "Shipped") {
    completed(2);
} else if (orderStatus === "Delivered") {
    completed(3);
} else if (orderStatus === "Cancelled") {
    cancelled(2);
}

function completed(completedStage) {
    if (completedStage >= 2) {
        orderTracking[1].classList.add('completed');
    }
    if (completedStage == 3) {
        setTimeout(() => {
            orderTracking[2].classList.add('completed');
        }, 1500);
    }
}

function cancelled(cancelledStage) {
    if (cancelledStage >= 2) {
        orderTracking[1].classList.add('cancelled');
    }
}

// Cancel order Confirmation
if (document.getElementById('cancel-order-form')) {
    document.forms['cancel-order-form'].onsubmit = (e) => {
        let confirmMsg = "Are you sure for cancel order?\nClick on 'OK' to continue...";
        if (confirm(confirmMsg)) {
            return true;
        } else {
            e.preventDefault();
        }
    }
}

// Confirm shipping order
const shipOrderForm = document.getElementById('ship-order-form');
if (shipOrderForm) {
    confirmShipping(shipOrderForm);
}
// Function for confirm shipping
function confirmShipping(formElement) {
    formElement.addEventListener('submit', (event) => {
        console.log("Executed!");
        let confirm_msg = "Order is go for shipping!...";
        if (confirm(confirm_msg)) {
            return true;
        } else {
            event.preventDefault();
        }
    })
}