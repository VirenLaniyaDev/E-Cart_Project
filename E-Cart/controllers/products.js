const Product = require('../models/product').Product;
const Order = require('../models/order').Order;

exports.getIndexWithProducts = (req, res) => {
    Product.fetchIndexProducts()
        .then(products => {
            res.render('index', {
                pageTitle: "Home",
                products: products,
                errorMessage: req.flash('error'),
                successMessage: req.flash('success'),
                warningMessage: req.flash('warning')
            });
        })
        .catch(err => { throw err });
}

exports.getProduct = (req, res) => {
    const productId = req.params.productId;

    let _product;
    Product.getProduct(productId)
        .then(product => {
            _product = product;
            return Product.getSellerById(product.sellerId);
        })
        .then(seller => {
            res.render('product/product-view', {
                pageTitle: _product.title,
                product: _product,
                seller: seller,
                user: req.user,
                errorMessage: req.flash('error'),
                successMessage: req.flash('success'),
                warningMessage: req.flash('warning')
            })
        })
        .catch(err => { throw err });
}

exports.getCategoryProducts = (req, res) => {
    const category = req.query.category;
    const subcategory = req.query.subcategory;
    const filters = {
        min_price: req.query.min_price ? +req.query.min_price : null,
        max_price: req.query.max_price ? +req.query.max_price : null,
        ratings: getRatingFilter(req.query.rating_filter)
    }
    Product.getProductsByCategory(category, subcategory, filters)
        .then(products => {
            res.render('product/search-products', {
                pageTitle: subcategory ? subcategory : category,
                products: products,
                search_string: null,
                category: category,
                subcategory: subcategory,
                filters: filters,
                errorMessage: req.flash('error'),
                successMessage: req.flash('success'),
                warningMessage: req.flash('warning')
            });
        })
        .catch(err => { throw err });
}

function getRatingFilter(ratings) {
    if (!ratings) {
        return null;
    }
    if (typeof (ratings) === 'string') {
        return +ratings;
    } else {
        let min_rating = ratings[0];
        ratings.forEach(rating => {
            if (+rating < min_rating)
                min_rating = +rating;
        })
        return min_rating;
    }
}

exports.getSearchProducts = (req, res) => {
    const search_string = req.query.search;
    const filters = {
        min_price: req.query.min_price ? +req.query.min_price : null,
        max_price: req.query.max_price ? +req.query.max_price : null,
        ratings: getRatingFilter(req.query.rating_filter)
    }
    Product.getSearchProducts(search_string, filters)
        .then(products => {
            res.render('product/search-products', {
                pageTitle: search_string,
                search_string: search_string,
                category: null,
                subcategory: null,
                products: products,
                filters: filters,
                errorMessage: req.flash('error'),
                successMessage: req.flash('success'),
                warningMessage: req.flash('warning')
            });
        })
        .catch(err => { throw err });
}

exports.postRateProduct = (req, res) => {
    const productId = req.body.productId;
    const orderId = req.body.orderId;
    const rating = req.body.rate;
    Product.rateProduct(rating, productId)
        .then(result => {
            return Order.setProductRating_byUser(rating, orderId)
        })
        .then(async result => {
            await req.flash('success', "Thanks for the Rating!");
            res.redirect(`/order/${orderId}`);
        })
        .catch(err => { throw err });
}