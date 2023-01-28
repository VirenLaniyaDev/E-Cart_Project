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


// Seller info btn
const infoBtn = document.querySelector('.i-btn');
const sellerInfo = document.querySelector('.seller-info');
infoBtn.addEventListener('click', () => {
    sellerInfo.classList.toggle('d-none');
})

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