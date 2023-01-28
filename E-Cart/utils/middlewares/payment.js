module.exports = (req, res, next) => {
    if (req.body.paymentMethod === "online") {
        console.log("Online payment gateway will be added soon...");
    }
    next();
}