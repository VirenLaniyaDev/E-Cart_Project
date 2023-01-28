module.exports = (products) => {
    let priceOfItems = 0;
    let discount = 0;
    let deliveryCharges = 0;
    let packagingFee = 0;
    let totalAmount = 0;
    let totalSavings = 0;

    products.forEach(product => {
        priceOfItems += product.sellingPrice * product.cp_quantity;
        discount += (product.MRP * product.cp_quantity - product.sellingPrice * product.cp_quantity);
        if(product.sellingPrice * product.cp_quantity < 400){
            deliveryCharges += 40;
        } 
        if(product.sellingPrice >= 3999 ){
            packagingFee += 29; 
        }
    });

    totalAmount = priceOfItems + deliveryCharges + packagingFee;

    totalSavings = discount - (deliveryCharges + packagingFee);

    return {
        priceOfItems: priceOfItems,
        discount: discount,
        deliveryCharges: deliveryCharges,
        packagingFee: packagingFee,
        totalAmount: totalAmount,
        totalSavings: totalSavings
    }
}