const mongodb = require('mongodb');
const getDB = require('../services/connect_database').getDB;

// Helper utility
const fileOps = require('../utils/fileOperations');

module.exports = class Product {
    constructor(title, category, subcategory, mrp, sellingPrice, quantity, image, delivery_days, description, sellerId, productId) {
        this.title = title;
        this.category = category;
        this.subcategory = subcategory;
        this.MRP = mrp;
        this.sellingPrice = sellingPrice;
        this.discount_percentage = Math.round((mrp - sellingPrice) / mrp * 100);
        this.quantity = quantity;
        if (image) {
            this.image = image;
        }
        this.delivery_within_days = delivery_days;
        this.description = description;
        this.sellerId = sellerId;
        if (!productId) {
            this.createdAt = new Date();
        }
        this.updatedAt = new Date();
        if (productId) {
            this._id = new mongodb.ObjectId(productId);
        } else {
            this.user_ratings = { "star_5": 0, "star_4": 0, "star_3": 0, "star_2": 0, "star_1": 0 };
            this.product_rating = 0;
            this.product_ratedBy = 0;
            this._id = null;
        }
    }

    save() {
        if (this._id) {
            return getDB().collection('products').updateOne({ _id: this._id }, { $set: this })
        }
        return getDB().collection('products').insertOne(this);
    }

    // Static Methods
    static deleteProductById(productId) {
        return this.getProductById(productId)
            .then(product => {
                // 1. Delete product files that was stored along with data
                fileOps.deleteFile(product.image);
            })
            .then(() => {
                // 2. Delete product data from database
                return getDB().collection('products').deleteOne({ _id: new mongodb.ObjectId(productId) });
            })
    }

    static getSellerProducts(sellerId) {
        return getDB().collection('products').find({ sellerId: new mongodb.ObjectId(sellerId) }).sort({ updatedAt: -1 }).toArray();
    }

    static getProductById(productId) {
        return getDB().collection('products').findOne({ _id: new mongodb.ObjectId(productId) });
    }
}