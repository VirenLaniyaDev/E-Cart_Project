const mongodb = require('mongodb');
const getDB = require('../services/connect_database').getDB;

exports.User = class User {

    // When User object will created it will takes some arguments which is the fields for users database
    constructor(name, email, password, cart, address, mobile, gender, profilePicture, userId) {
        this.name = name;
        this.email = email.toLowerCase();
        if (password) {
            this.password = password;
        }
        if (cart) {
            this.cart = cart;
        }
        if (address) {
            this.address = address;
        }
        if (gender) {
            this.gender = gender;
        }
        if (mobile) {
            this.mobile = mobile;
        }
        if (profilePicture) {
            this.profilePicture = profilePicture;
        }
        if (userId) {
            this._id = new mongodb.ObjectId(userId);
        }
    }

    // Insert 'this' with all included fields
    save() {
        if (this._id) {
            return getDB().collection('users').updateOne({ _id: this._id }, { $set: this });
        } else {
            return getDB().collection('users').insertOne(this);
        }
    }

    updatePassword(new_password) {
        return getDB().collection('users').updateOne({ _id: this._id }, { $set: { password: new_password } });
    }

    // Change address
    updateAddress(address) {
        return getDB().collection('users').updateOne({ _id: this._id }, { $set: { address: address } });
    }
    // Change mobile
    updateMobile(mobile) {
        return getDB().collection('users').updateOne({ _id: this._id }, { $set: { mobile: mobile } });
    }

    addToCart(productId, productQuantity) {
        // 1. Find whether product exists or not. If exists it will return index otherwise -1
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === productId;
        })

        let newQuantity = 1;
        let updatedCartItems = [...this.cart.items];

        // If product already exists then simply quantity increment by one, otherwise push new item to the cart
        if (cartProductIndex >= 0) {
            let existingQuantity = this.cart.items[cartProductIndex].quantity;
            if (existingQuantity < productQuantity) {
                newQuantity = existingQuantity + 1;
            } else {
                newQuantity = existingQuantity;
            }
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({
                productId: new mongodb.ObjectId(productId),
                quantity: newQuantity
            })
        }

        const updatedCart = { items: updatedCartItems };
        return getDB().collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
    }

    getCart() {
        const productIds = this.cart.items.map(item => {
            return item.productId;
        });

        return getDB().collection('products')
            .find({ _id: { $in: productIds } }).toArray()
            .then(async products => {
                let _products = products.filter(product => {
                    if (product.quantity <= 0) {
                        this.cart_prod_remove(product._id.toString())
                            .then(result => {
                                console.log("unavailable product removed from cart!");
                                return false;
                            })
                            .catch(err => { throw err });
                    } else {
                        return true;
                    }
                });
                let _products_result = await Promise.all(_products);
                return _products_result;
            })
            .then(async products => {
                let product_info = products.map(product => {
                    return User.getSellerInfo(product.sellerId)
                        .then(seller => {
                            return {
                                ...product,
                                cp_quantity: this.cart.items.find(item => {
                                    return item.productId.toString() === product._id.toString();
                                }).quantity,
                                seller: seller
                            }
                        })
                        .catch(err => { throw err })
                })

                const result = await Promise.all(product_info);
                return result;
            })
    }

    // Decrement quantity of product of cart
    cart_prod_qnty_decrement(productId) {
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === productId;
        })

        let updatedCartItems = [...this.cart.items];
        let newQuantity;
        let existingQuantity = this.cart.items[cartProductIndex].quantity;
        if (existingQuantity > 1) {
            newQuantity = existingQuantity - 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        }

        const updatedCart = { items: updatedCartItems };
        return getDB().collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
    }

    cart_prod_qnty_increment(productId, productQuantity) {
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === productId;
        })

        let updatedCartItems = [...this.cart.items];
        if (this.cart.items[cartProductIndex].quantity < productQuantity) {
            updatedCartItems[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity + 1;
        }
        const updatedCart = { items: updatedCartItems };

        return getDB().collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
    }

    // Remove product from the user cart
    cart_prod_remove(productId) {
        let updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId
        });
        const updatedCart = { items: updatedCartItems };

        return getDB().collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
    }

    // get Empty cart
    emptyCart() {
        return getDB().collection('users').updateOne({ _id: this._id }, { $set: { "cart.items": [] } });
    }

    getDirectProductById(productId) {
        return getDB().collection('products')
            .findOne({ _id: new mongodb.ObjectId(productId) })
            .then(product => {
                if (product.quantity > 0) {
                    return User.getSellerInfo(product.sellerId)
                        .then(seller => {
                            return {
                                ...product,
                                cp_quantity: 1,
                                seller: seller
                            }
                        })
                        .catch(err => { throw err })
                }
            })
    }

    // Creating order by user
    createOrder(productInfo, paymentStatus, orderAmount) {
        let date = new Date();
        let orderInfo = {
            status: "Ordered",
            product: {
                _id: productInfo._id,
                title: productInfo.title,
                MRP: productInfo.MRP,
                sellingPrice: productInfo.sellingPrice,
                discount_percentage: productInfo.discount_percentage,
                image: productInfo.image,
                ordered_quantity: productInfo.cp_quantity
            },
            seller: {
                _id: productInfo.sellerId,
                name: productInfo.seller.name,
                business_name: productInfo.seller.business_name
            },
            user: {
                _id: this._id,
                name: this.name,
                email: this.email,
                delivery_address: this.address,
                mobile: this.mobile
            },
            delivery_on: new Date(date.setDate(date.getDate() + productInfo.delivery_within_days)),
            payment_status: paymentStatus,
            orderAmount: {
                priceAmount: orderAmount.priceOfItems,
                deliveryCharges: orderAmount.deliveryCharges,
                packagingFee: orderAmount.packagingFee,
                totalAmount: orderAmount.totalAmount
            },
            createdAt: new Date()
        }
        return getDB().collection('orders').insertOne(orderInfo);
    }

    // Get orders
    getOrders() {
        return getDB().collection('orders').find({ "user._id": this._id }).sort({ createdAt: -1 }).toArray();
    }

    getOrderById(orderId) {
        return getDB().collection('orders').findOne({ _id: new mongodb.ObjectId(orderId), "user._id": this._id });
    }
    
    // Static methods
    static findByEmail(email) {
        return getDB().collection('users').findOne({ email: email });
    }

    static findByUserId(userId) {
        return getDB().collection('users').findOne({ _id: new mongodb.ObjectId(userId) });
    }

    static getSellerInfo(sellerId) {
        return getDB().collection('sellers').findOne({ _id: new mongodb.ObjectId(sellerId) });
    }

    static findByMobile(mobile) {
        return getDB().collection('users').findOne({ mobile: mobile });
    }
}

exports.UserResetPassword = class UserResetPassword {
    constructor(token, userId) {
        this.userId = userId;
        this.token = token;
        this.createdAt = new Date();
    }

    setResetPassToken() {
        let _db = getDB();
        // 1. Create index for TTL(time to leave)
        _db.collection('reset_password').createIndex({ "createdAt": 1 }, { expireAfterSeconds: 60*30 });
        // 2. Inserting token record to 'reset_password' collection
        return _db.collection('reset_password').findOne({ userId: this.userId })
            .then(data => {
                if (data) {
                    return _db.collection('reset_password').updateOne({ userId: this.userId }, { $set: this })
                } else {
                    return _db.collection('reset_password').insertOne(this);
                }
            })
    }

    // Static methods
    static getResetPassToken(token) {
        return getDB().collection('reset_password').findOne({ token: token, userId: { $exists: true } });
    }

    static resetPassword(new_password, userId) {
        return getDB().collection('users').updateOne({ _id: new mongodb.ObjectId(userId) }, { $set: { password: new_password } });
    }

    static deleteResetPassToken(userId) {
        return getDB().collection('reset_password').deleteOne({ userId: new mongodb.ObjectId(userId) });
    }
}