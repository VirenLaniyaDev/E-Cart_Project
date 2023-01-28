const mongodb = require('mongodb');
const getDB = require("../services/connect_database").getDB;

exports.Checkout = class Checkout {

    static findProductIndex(productId, req) {
        const productIndex = req.session.checkout_productsInfo.findIndex(cp => {
            return cp._id.toString() === productId;
        })
        return productIndex;
    }

    static removeProduct(productId, req) {
        const removedProduct_arr = req.session.checkout_productsInfo.filter(cp => {
            return cp._id.toString() !== productId;
        })
        return removedProduct_arr;
    }
}

exports.Order = class Order {
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

    static setProductRating_byUser(rating, orderId) {
        return getDB().collection('orders').updateOne({ _id: new mongodb.ObjectId(orderId) }, { $set: { productRating_byUser: +rating } })
    }
}