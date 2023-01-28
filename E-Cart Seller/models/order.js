const mongodb = require('mongodb');
const getDB = require('../services/connect_database').getDB;

exports.Order = class Order {
    //Getting Counts of new order requests
    static getOrderRequestCount(sellerId) {
        return getDB().collection('orders').countDocuments({ "seller._id": sellerId, "status": "Ordered" });
    }

    // Getting Order statistics of Seller
    static getSellerOrdersStats(sellerId) {
        let order_requests, shipped_orders, delivered_orders, cancelled_orders;
        const _db = getDB();
        return _db.collection('orders').countDocuments({ "seller._id": sellerId, "status": "Ordered" })
            .then(order_requests_counts => {
                order_requests = order_requests_counts;
                return _db.collection('orders').countDocuments({ "seller._id": sellerId, "status": "Shipped" });
            })
            .then(shipped_orders_counts => {
                shipped_orders = shipped_orders_counts;
                return _db.collection('orders').countDocuments({ "seller._id": sellerId, "status": "Delivered" });
            })
            .then(delivered_orders_counts => {
                delivered_orders = delivered_orders_counts;
                return _db.collection('orders').countDocuments({ "seller._id": sellerId, "status": "Cancelled" });
            })
            .then(cancelled_orders_counts => {
                cancelled_orders = cancelled_orders_counts;
                return {
                    order_requests: order_requests,
                    shipped_orders: shipped_orders,
                    delivered_orders: delivered_orders,
                    cancelled_orders: cancelled_orders,
                    total_orders: (order_requests + shipped_orders + delivered_orders + cancelled_orders)
                }
            })
    }

    // Cancelling order
    static cancelOrder(orderId) {
        let _db = getDB();
        return _db.collection('orders').findOne({ _id: new mongodb.ObjectId(orderId) })
            .then(order => {
                let incrementBy = order.product.ordered_quantity;
                return _db.collection('products').updateOne({ _id: order.product._id }, { $inc: { quantity: incrementBy } });
            })
            .then(result => {
                return _db.collection('orders').updateOne({ _id: new mongodb.ObjectId(orderId) },
                    {
                        $set: {
                            status: "Cancelled",
                            cancelled_on: new Date()
                        }
                    })
            })
    }

    // Get order by order id
    static getOrderById(orderId) {
        return getDB().collection('orders').findOne({ _id: mongodb.ObjectId(orderId) });
    }

    // Confirm delivery
    static setOtpToken(orderId, token, OTP) {
        let _db = getDB();
        const confirmDeliveryObj = {
            orderId: new mongodb.ObjectId(orderId),
            token: token,
            OTP: OTP,
            createdAt: new Date()
        }
        // 1. Create index for TTL(time to leave)
        _db.collection('confirm_delivery').createIndex({ "createdAt": 1 }, { expireAfterSeconds: 60 * 10 });
        // 2. Inserting token record to 'confirm_delivery' collection
        return _db.collection('confirm_delivery').findOne({ orderId: new mongodb.ObjectId(orderId) })
            .then(data => {
                if (data) {
                    return _db.collection('confirm_delivery').updateOne({ orderId: new mongodb.ObjectId(orderId) }, { $set: confirmDeliveryObj })
                } else {
                    return _db.collection('confirm_delivery').insertOne(confirmDeliveryObj);
                }
            })
    }

    // OTP Management
    static getOTP(orderId, otpToken) {
        return getDB().collection('confirm_delivery').findOne({ orderId: new mongodb.ObjectId(orderId), token: otpToken });
    }
    
    static deleteOTP(orderId, otpToken){
        return getDB().collection('confirm_delivery').deleteOne({ orderId: new mongodb.ObjectId(orderId), token: otpToken });
    }
}
