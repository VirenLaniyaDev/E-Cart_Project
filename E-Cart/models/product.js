const mongodb = require('mongodb');
const getDB = require('../services/connect_database').getDB;

exports.Product = class Product {
    static getProduct(productId) {
        return getDB().collection('products').findOne({ _id: new mongodb.ObjectId(productId) });
    }

    static getSellerById(sellerId) {
        return getDB().collection('sellers').findOne({ _id: sellerId });
    }

    static decreaseQuantity(productId, decreaseBy) {
        return getDB().collection('products').updateOne({ _id: new mongodb.ObjectId(productId) }, { $inc: { quantity: -decreaseBy } });
    }

    static async fetchIndexProducts() {
        let top_discount_mobileProds = await this.fetchTopDiscountMobileProds();
        let top_discount_electronicProds = await this.fetchTopDiscountElectronicProds();
        let top_discount_fashionProds = await this.fetchTopDiscountFashionProds();
        let top_discount_applianceProds = await this.fetchTopDiscountApplianceProds();
        let top_discount_toyProds = await this.fetchTopDiscountToyProds();

        return {
            top_discount_mobileProds: top_discount_mobileProds,
            top_discount_electronicProds: top_discount_electronicProds,
            top_discount_fashionProds: top_discount_fashionProds,
            top_discount_applianceProds: top_discount_applianceProds,
            top_discount_toyProds: top_discount_toyProds
        };
    }

    static fetchTopDiscountProducts() {
        return getDB().collection("products").find().sort({ "discount_percentage": -1 }).limit(20).toArray();
    }

    static fetchTopDiscountMobileProds() {
        return getDB().collection("products").find({ "category": "mobiles" }).sort({ "discount_percentage": -1 }).limit(20).toArray();
    }

    static fetchTopDiscountElectronicProds() {
        return getDB().collection("products").find({ "category": "electronics" }).sort({ "discount_percentage": -1 }).limit(20).toArray();
    }

    static fetchTopDiscountFashionProds() {
        return getDB().collection("products").find({ "category": "fashion" }).sort({ "discount_percentage": -1 }).limit(20).toArray();
    }

    static fetchTopDiscountApplianceProds() {
        return getDB().collection("products").find({ "category": "appliance" }).sort({ "discount_percentage": -1 }).limit(20).toArray();
    }

    static fetchTopDiscountToyProds() {
        return getDB().collection("products").find({ "category": "toys" }).sort({ "discount_percentage": -1 }).limit(20).toArray();
    }


    static getProductsByCategory(category, subcategory, filters) {
        return getDB().collection("products").find({ "category": category, "subcategory": subcategory ? subcategory : null }).toArray()
            .then(products => {
                return applyFilters(products, filters);
            })
            .then(products => {
                return this.syncProducts_withTheir_Sellers(products);
            })
    }

    static getSearchProducts(search_string, filters) {
        let strings = search_string.split(" ");
        let regex = strings.join("|");
        return getDB().collection("products").find({
            $or: [
                { "title": { $regex: regex, $options: "i" } },
                { "category": { $regex: regex, $options: "i" } },
                { "subcategory": { $regex: regex, $options: "i" } }
            ]
        }).toArray()
            .then(products => {
                return applyFilters(products, filters);
            })
            .then(products => {
                return this.syncProducts_withTheir_Sellers(products);
            });
    }

    static async syncProducts_withTheir_Sellers(products) {
        let product_info = products.map(product => {
            return this.getSellerById(product.sellerId)
                .then(seller => {
                    return {
                        ...product,
                        seller_businessName: seller.business_name
                    }
                })
                .catch(err => { throw err })
        })

        const result = await Promise.all(product_info);
        return result;
    }

    static rateProduct(rating, productId) {
        let _db = getDB();
        const _productId = new mongodb.ObjectId(productId);
        return updateUserRatings(rating, _productId)
            .then(result => {
                return _db.collection('products').findOne({ _id: _productId });
            })
            .then(rating_result => {
                const { star_5, star_4, star_3, star_2, star_1 } = rating_result.user_ratings;
                let average_product_rating = (+star_1 * 1) + (+star_2 * 2) + (+star_3 * 3) + (+star_4 * 4) + (+star_5 * 5);
                average_product_rating /= +rating_result.product_ratedBy;
                average_product_rating = Math.round(average_product_rating * 10) / 10
                return _db.collection('products').updateOne({ _id: _productId }, { $set: { product_rating: average_product_rating } });
            })
    }

}

function updateUserRatings(rating, productId) {
    let _db = getDB();
    if (+rating == 5) {
        return _db.collection('products').updateOne({ _id: productId }, { $inc: { "user_ratings.star_5": 1, "product_ratedBy": 1 } });
    } else if (+rating == 4) {
        return _db.collection('products').updateOne({ _id: productId }, { $inc: { "user_ratings.star_4": 1, "product_ratedBy": 1 } });
    } else if (+rating == 3) {
        return _db.collection('products').updateOne({ _id: productId }, { $inc: { "user_ratings.star_3": 1, "product_ratedBy": 1 } });
    } else if (+rating == 2) {
        return _db.collection('products').updateOne({ _id: productId }, { $inc: { "user_ratings.star_2": 1, "product_ratedBy": 1 } });
    } else if (+rating == 1) {
        return _db.collection('products').updateOne({ _id: productId }, { $inc: { "user_ratings.star_1": 1, "product_ratedBy": 1 } });
    }
}

function applyFilters(products, filters) {
    return products.filter(product => {
        return (filters.min_price ? (product.sellingPrice >= filters.min_price) : true) &&
            (filters.max_price ? (product.sellingPrice <= filters.max_price) : true) &&
            (filters.ratings ? (product.product_rating >= filters.ratings) : true)
    })
}