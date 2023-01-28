let confirm_msg = `Confirm deletion of Product\nNOTE: Product will be deleted along with all synced files.\nClick on 'OK' to delete product`;

// Deleting product in View product page
if (document.getElementById("delete-product")) {
    document.forms['delete-product'].onsubmit = (e) => {
        if (confirm(confirm_msg)) {
            return true;
        } else {
            e.preventDefault();
        }
    }
}

// Deleting products in Manage products page
if (document.getElementById("products-table")) {
    const productsLength = document.getElementById("products-table").dataset.prodlength;
    for (var i = 1; i <= productsLength; i++) {
        // Handling multiple forms
        document.forms[`delete-product-${i}`].onsubmit = (e) => {
            if (confirm(confirm_msg)) {
                return true;
            } else {
                e.preventDefault();
            }
        }
    }
}
