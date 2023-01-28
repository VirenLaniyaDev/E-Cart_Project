const mongodb = require('mongodb');
const getDB = require('../services/connect_database').getDB;

const sellerHelper = require('../utils/helpers/sellerHelper').SellerHelper;

exports.Seller = class Seller {

    // When Seller object will created it will takes some arguments which is the fields for sellers database
    constructor(name, business_name, mobile, email, password, aboutSeller, business_GSTIN, business_Address, bank_name, bank_account_no, bank_IFSC, imageURL, sellerId) {
        this.name = name;
        this.business_name = business_name;
        this.mobile = mobile;
        this.email = email.toLowerCase();
        if (password) {
            this.password = password;
        }
        if (aboutSeller) {
            this.about_seller = aboutSeller;
        }
        if (business_GSTIN) {
            this.business_GSTIN = business_GSTIN;
        }
        if (business_Address) {
            this.business_address = business_Address;
        }
        if (bank_name) {
            this.bank_name = bank_name;
        }
        if (bank_account_no) {
            this.bank_account_no = bank_account_no;
        }
        if (bank_IFSC) {
            this.bank_IFSC = bank_IFSC;
        }
        if (imageURL) {
            this.profilePicture = imageURL;
        }
        if (sellerId) {
            this._id = new mongodb.ObjectId(sellerId);
        }
    }

    // Saving 'this' with all included fields
    save() {
        if (this._id) {
            return getDB().collection('sellers').updateOne({ _id: this._id }, { $set: this });
        } else {
            return getDB().collection('sellers').insertOne(this);
        }
    }

    updatePassword(new_password) {
        return getDB().collection('sellers').updateOne({ _id: this._id }, { $set: { password: new_password } });
    }

    // Managing orders
    getOrders(status) {
        if (status === "Delivered") {
            return getDB().collection('orders').find({ "seller._id": this._id, status: status }).sort({ delivery_on: -1 }).toArray();
        } else if (status == "Cancelled") {
            return getDB().collection('orders').find({ "seller._id": this._id, status: status }).sort({ cancelled_on: -1 }).toArray();
        } else {
            return getDB().collection('orders').find({ "seller._id": this._id, status: status }).sort({ createdAt: -1 }).toArray();
        }
    }

    getOrder(orderId) {
        return getDB().collection('orders').findOne({ "seller._id": this._id, _id: new mongodb.ObjectId(orderId) });
    }

    shipOrder(orderId) {
        return getDB().collection('orders').updateOne({ "seller._id": this._id, _id: new mongodb.ObjectId(orderId) },
            {
                $set: {
                    status: "Shipped",
                    shipped_on: new Date()
                }
            }
        )
    }

    orderDelivered(orderId) {
        return getDB().collection('orders').updateOne({ "seller._id": this._id, _id: new mongodb.ObjectId(orderId) },
            {
                $set: {
                    status: "Delivered",
                    payment_status: "done",
                    delivery_on: new Date()
                }
            }
        )
    }

    async getSellerChartData() {
        return sellerHelper.seller_getChartData(this._id);
    } 

    async getSellerOverview() {
        // let sellerOverview = await sellerHelper.seller_getOverview(this._id);
        return await sellerHelper.seller_getOverview(this._id);
    }

    // Static methods
    static findByEmail(email) {
        return getDB().collection('sellers').findOne({ email: email });
    }

    static findBySellerId(sellerId) {
        return getDB().collection('sellers').findOne({ _id: new mongodb.ObjectId(sellerId) });
    }

    static findByMobile(mobile) {
        return getDB().collection('sellers').findOne({ mobile: mobile });
    }

}

exports.SellerResetPassword = class SellerResetPassword {

    constructor(token, sellerId) {
        this.sellerId = sellerId;
        this.token = token;
        this.createdAt = new Date();
    }

    setResetPassToken() {
        let _db = getDB();
        // 1. Create index for TTL(time to leave)
        _db.collection('reset_password').createIndex({ "createdAt": 1 }, { expireAfterSeconds: 60 * 30 });
        // 2. Inserting token record to 'reset_password' collection
        return _db.collection('reset_password').findOne({ sellerId: this.sellerId })
            .then(data => {
                if (data) {
                    return _db.collection('reset_password').updateOne({ sellerId: this.sellerId }, { $set: this })
                } else {
                    return _db.collection('reset_password').insertOne(this);
                }
            })
    }

    // Static methods
    static getResetPassToken(token) {
        return getDB().collection('reset_password').findOne({ token: token, sellerId: { $exists: true } });
    }

    static resetPassword(new_password, sellerId) {
        return getDB().collection('sellers').updateOne({ _id: new mongodb.ObjectId(sellerId) }, { $set: { password: new_password } });
    }

    static deleteResetPassToken(sellerId) {
        return getDB().collection('reset_password').deleteOne({ sellerId: new mongodb.ObjectId(sellerId) });
    }
}