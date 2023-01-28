const calc_pricingDetails = require('../utils/helpers/calc_pricingDetails');

const Product = require('../models/product').Product;

exports.postAddToCart = (req, res) => {
    const productId = req.params.productId;
    Product.getProduct(productId)
        .then(product => {
            return req.user.addToCart(productId, product.quantity)
        })
        .then(async result => {
            await req.flash('success', "Item added to the Cart!");
            res.redirect(`/product/${productId}`);
        })
        .catch(err => { throw err })
}

exports.getCart = (req, res) => {
    req.user.getCart()
        .then(products => {
            req.session.returnTo = req.originalUrl;

            const priceDetails = calc_pricingDetails(products);
            res.render('product/cart', {
                pageTitle: "Cart",
                products: products,
                priceDetails: priceDetails,
                user: req.user,
                errorMessage: req.flash('error'),
                successMessage: req.flash('success'),
                warningMessage: req.flash('warning')
            })
        })
        .catch(err => { throw err });
}

exports.postQntyDecrement = (req, res) => {
    const productId = req.body.productId;

    req.user.cart_prod_qnty_decrement(productId)
        .then(result => {
            res.redirect(req.session.returnTo || '/cart');
        })
        .catch(err => { throw err })
}

exports.postQntyIncrement = (req, res) => {
    const productId = req.body.productId;
    const productQuantity = +req.body.prod_quantity;
    req.user.cart_prod_qnty_increment(productId, productQuantity)
        .then(result => {
            res.redirect(req.session.returnTo || '/cart');
        })
        .catch(err => { throw err })
}

exports.postRemoveCartProduct = (req, res) => {
    const productId = req.body.productId;

    req.user.cart_prod_remove(productId)
        .then(result => {
            res.redirect(req.session.returnTo || '/cart');
        })
        .catch(err => { throw err });
}