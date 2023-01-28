const OrderModel = require('../../models/order').Order;

locals = (req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    if (req.seller) {
        res.locals.sellerName = req.seller.name;
        res.locals.profilePicture = req.seller.profilePicture;
        OrderModel.getOrderRequestCount(req.seller._id)
            .then(order_request_count => {
                res.locals.pendingOrders = order_request_count;
                next();
            })
            .catch(err=>{ throw err });
    } else {
        next();
    }
}

module.exports = locals;