const calc_pricingDetails = require('../utils/helpers/calc_pricingDetails');

const checkoutModel = require('../models/order').Checkout;
const Product = require('../models/product').Product;
const Order = require('../models/order').Order;

exports.getCartCheckout = (req, res) => {
    let priceDetails;
    // If request is made after performing increment or decrement product quantity or remove product on Checkout page
    if (req.session.checkoutAction) {
        delete req.session.checkoutAction;

        let productsInfo = req.session.checkout_productsInfo;
        priceDetails = calc_pricingDetails(productsInfo);
        res.render('product/checkout', {
            pageTitle: "Checkout",
            products: productsInfo,
            priceDetails: priceDetails,
            user: req.user,
            errorMessage: req.flash('error'),
            successMessage: req.flash('success'),
            warningMessage: req.flash('warning')
        })
    }
    // Otherwise serving products from cart
    else {
        req.user.getCart()
            .then(products => {
                req.session.returnTo = req.originalUrl;
                req.session.checkout_productsInfo = products;

                priceDetails = calc_pricingDetails(products);
                res.render('product/checkout', {
                    pageTitle: "Checkout",
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
}

exports.getDirectProdCheckout = (req, res) => {
    let priceDetails;
    if (req.session.checkoutAction) {
        delete req.session.checkoutAction;

        let productInfo = req.session.checkout_productsInfo;
        priceDetails = calc_pricingDetails(productInfo);
        res.render('product/checkout', {
            pageTitle: "Checkout",
            products: productInfo,
            priceDetails: priceDetails,
            user: req.user,
            errorMessage: req.flash('error'),
            successMessage: req.flash('success'),
            warningMessage: req.flash('warning')
        })
    }
    // Otherwise serving products from cart
    else {
        const productId = req.params.productId;
        req.user.getDirectProductById(productId)
            .then(product => {
                let _product = product ? [product] : [];
                req.session.returnTo = req.originalUrl;
                req.session.checkout_productsInfo = _product;

                priceDetails = calc_pricingDetails(_product);
                res.render('product/checkout', {
                    pageTitle: "Checkout",
                    products: _product,
                    priceDetails: priceDetails,
                    user: req.user,
                    errorMessage: req.flash('error'),
                    successMessage: req.flash('success'),
                    warningMessage: req.flash('warning')
                })
            })
            .catch(err => { throw err });
    }
}

exports.checkout_qntyDecrement = (req, res) => {
    const productId = req.body.productId;

    const prodIndex = checkoutModel.findProductIndex(productId, req);
    if (req.session.checkout_productsInfo[prodIndex].cp_quantity > 1) {
        req.session.checkout_productsInfo[prodIndex].cp_quantity -= 1;
    }
    req.session.checkoutAction = true;
    req.session.save(err => {
        if (err)
            throw err;
        return res.redirect(req.session.returnTo);
    })
}

exports.checkout_qntyIncrement = (req, res) => {
    const productId = req.body.productId;

    const prodIndex = checkoutModel.findProductIndex(productId, req);
    const cp_quantity = req.session.checkout_productsInfo[prodIndex].cp_quantity;
    const quantity = req.session.checkout_productsInfo[prodIndex].quantity;
    if (cp_quantity < quantity) {
        req.session.checkout_productsInfo[prodIndex].cp_quantity += 1;
    }
    req.session.checkoutAction = true;
    req.session.save(err => {
        if (err)
            throw err;
        return res.redirect(req.session.returnTo);
    })
}

exports.checkout_remove = (req, res) => {
    const productId = req.body.productId;

    const result = checkoutModel.removeProduct(productId, req);
    req.session.checkout_productsInfo = result;
    req.session.checkoutAction = true;
    req.session.save(err => {
        if (err)
            throw err;
        return res.redirect(req.session.returnTo);
    })
}

exports.getOrders = (req, res) => {
    req.user.getOrders()
        .then(orders => {
            res.render('product/orders', {
                pageTitle: "Your orders",
                orders: orders,
                errorMessage: req.flash('error'),
                successMessage: req.flash('success'),
                warningMessage: req.flash('warning')
            })
        })
        .catch(err => { throw err });
}

exports.postPlaceOrder = async (req, res) => {
    const orderProductsInfo = req.session.checkout_productsInfo;
    const payment_status = req.body.paymentMethod === "online" ? "done" : "cod"
    // 1. Creating order for each product
    await orderProductsInfo.forEach(orderProduct => {
        const orderAmount = calc_pricingDetails([orderProduct]);
        req.user.createOrder(orderProduct, payment_status, orderAmount)
            .then(result => {
                console.log("Order created!");
                return Product.decreaseQuantity(orderProduct._id, orderProduct.cp_quantity);
            })
            .then(result => {
                console.log("Product quantity is decreased!");
            })
            .catch(err => { throw err });
    });

    // 2. If order is done from cart then we should empty cart
    try {
        if (req.session.returnTo.split('/')[1] === "cart") {
            req.user.emptyCart()
                .then(result => {
                    console.log("Cart is empty!");
                })
                .catch(err => { throw err });
        }
    } finally {
        delete req.session.checkout_productsInfo;   // 3. Deleting checkout productInfo from user session
        delete req.session.returnTo;    // 4. Deleting returnTo from user session
        req.session.save(async err => {
            if (err)
                throw err;
            await req.flash('success', "Order successfully Placed!");
            res.redirect('/orders');
        }); // Saving the modified user session
    }
}

const e400_badRequest = require('./errors').e400_badRequest;
exports.getOrder = (req, res) => {
    const orderId = req.params.orderId;
    let _order;
    req.user.getOrderById(orderId)
        .then(order => {
            if (!order) {
                return e400_badRequest(req, res);
            } else {
                _order = order;
                return Product.getSellerById(order.seller._id);
            }
        })
        .then(seller => {
            if (_order) {
                res.render('product/order-view', {
                    pageTitle: "Check order",
                    order: _order,
                    seller: seller,
                    errorMessage: req.flash('error'),
                    successMessage: req.flash('success'),
                    warningMessage: req.flash('warning')
                })
            }
        })
        .catch(err => { throw err });
}

exports.postCancelOrder = (req, res) => {
    const orderId = req.body.orderId;
    Order.cancelOrder(orderId)
        .then(async result => {
            console.log("Order cancelled");
            await req.flash('warning', "Order Cancelled!");
            res.redirect(`/order/${orderId}`);
        })
        .catch(err => { throw err });
}

const createPDF = require('../services/invoice_generator').createPDF;
exports.postDownloadInvoice = (req, res) => {
    const orderId = req.body.orderId;
    let _order;
    req.user.getOrderById(orderId)
        .then(order => {
            if (!order || (order.status !== "Delivered")) {
                return "E400";
            }
            _order = order;
            return Product.getSellerById(order.seller._id)
        })
        .then(seller => {
            if (seller === "E400") {
                return e400_badRequest(req, res);
            } else {
                let pdfDoc = createPDF(_order, seller ? seller : {});
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename=Invoice_${_order._id.toString()}.pdf`);
                pdfDoc.pipe(res);
                pdfDoc.end();
            }
        })
        .catch(err => { throw err });
}