const crypto = require('crypto');
const Seller = require('../models/seller').Seller;

const Order = require('../models/order').Order;

const sendMail = require('../services/send_mail');
const SMS_services = require('../services/send_SMS');

exports.getOrderRequests = (req, res) => {
    let _orders;
    req.seller.getOrders("Ordered")
        .then(orders => {
            _orders = orders;
            return Order.getSellerOrdersStats(req.seller._id);
        })
        .then(orders_stats => {
            req.session.returnTo = req.originalUrl;
            req.session.save(err => {
                if (err) throw err;
                res.render('manage_orders/order-requests', {
                    pageTitle: "Order requests",
                    orders: _orders,
                    orders_stats: orders_stats,
                    errorMessage: req.flash('error'),
                    successMessage: req.flash('success'),
                    warningMessage: req.flash('warning')
                })
            })
        })
        .catch(err => { throw err });
}

const e400_badRequest = require('./errors').e400_badRequest;
exports.getOrder = (req, res) => {
    const orderId = req.params.orderId;

    req.seller.getOrder(orderId)
        .then(order => {
            if (order) {
                res.render('manage_orders/order-view', {
                    pageTitle: "View Order",
                    order: order,
                    returnTo: req.session.returnTo,
                    errorMessage: req.flash('error'),
                    successMessage: req.flash('success'),
                    warningMessage: req.flash('warning')
                })
            } else {
                e400_badRequest(req, res);
            }
        })
}

exports.postCancelOrder = (req, res) => {
    const orderId = req.body.orderId;
    Order.cancelOrder(orderId)
        .then(async result => {
            console.log("Order cancelled");
            await req.flash('warning', "Order cancelled!");
            res.redirect(`/orders/${orderId}`);
        })
        .catch(err => { throw err });
}

exports.getShippedOrders = (req, res) => {
    let _orders;
    req.seller.getOrders("Shipped")
        .then(orders => {
            _orders = orders;
            return Order.getSellerOrdersStats(req.seller._id);
        })
        .then(orders_stats => {
            req.session.returnTo = req.originalUrl;
            req.session.save(err => {
                if (err) throw err;
                res.render('manage_orders/shipped-orders', {
                    pageTitle: "Shipped Orders",
                    orders: _orders,
                    orders_stats: orders_stats,
                    errorMessage: req.flash('error'),
                    successMessage: req.flash('success'),
                    warningMessage: req.flash('warning')
                })
            })
        })
        .catch(err => { throw err });
}

exports.postShipOrder = (req, res) => {
    const orderId = req.body.orderId;
    req.seller.shipOrder(orderId)
        .then(async result => {
            console.log("Order shipped!");
            await req.flash('success', "Order is Shipped!");
            res.redirect(req.session.returnTo || '/orders/shipped-orders');
        })
        .catch(err => { throw err });
}

exports.postConfirmDelivery = (req, res) => {
    const orderId = req.body.orderId;
    let OTP = Math.floor(100000 + Math.random() * 900000);    // Generating OTP (6 digit)
    let _order;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect(req.session.returnTo || '/orders/shipped-orders');
        };
        const token = buffer.toString('hex');
        req.session.confirmDelivery = {
            orderId: orderId,
            otpToken: token
        }
        req.session.save();
        Order.getOrderById(orderId)
            .then(order => {
                _order = order;
                return SMS_services.confirmDelivery(OTP, order.user.mobile);    // for Production Environment
            })
            .then(message => {
                console.log("SMS OTP sent!");
                req.flash('success', "OTP Sent!");
                return Order.setOtpToken(orderId, token, OTP);
            })
            .then(result => {
                res.render('manage_orders/confirm-delivery', {
                    pageTitle: "Confirm Delivery",
                    order: _order,
                    returnTo: req.session.returnTo,
                    errorMessage: req.flash('error'),
                    successMessage: req.flash('success'),
                    warningMessage: req.flash('warning')
                })
            })
            .catch(err => { throw err });
    })
}

exports.postVerifyOTP = (req, res) => {
    Order.getOTP(req.session.confirmDelivery.orderId, req.session.confirmDelivery.otpToken)
        .then(data => {
            if (data) {
                res.status(200).send({
                    "status": true,
                    "OTP": data.OTP
                });
            } else {
                res.status(200).send({
                    "status": false
                });
            }
        })
        .catch(err => { throw err });
}

exports.postOrderDelivered = (req, res) => {
    const orderId = req.session.confirmDelivery.orderId;
    req.seller.orderDelivered(orderId)
        .then(result => {
            return Order.deleteOTP(orderId, req.session.confirmDelivery.otpToken);
        })
        .then(result => {
            delete req.session.confirmDelivery;
            req.session.save(async err => {
                if (err) throw err;
                await req.flash('success', "Order is Delivered successfully!");
                res.redirect('/orders/delivered-orders');
            });
            return Order.getOrderById(orderId);
        })
        .then(order => {
            return sendMail.orderDelivered(order);
        })
        .then(result => {
            console.log("order delivered mail sent!")
        })
        .catch(err => { throw err });
}

exports.getDeliveredOrders = (req, res) => {
    let _orders;
    req.seller.getOrders("Delivered")
        .then(orders => {
            _orders = orders;
            return Order.getSellerOrdersStats(req.seller._id);
        })
        .then(orders_stats => {
            req.session.returnTo = req.originalUrl;
            req.session.save(err => {
                if (err) throw err;
                res.render('manage_orders/delivered-orders', {
                    pageTitle: "Delivered Orders",
                    orders: _orders,
                    orders_stats: orders_stats,
                    errorMessage: req.flash('error'),
                    successMessage: req.flash('success'),
                    warningMessage: req.flash('warning')
                })
            })
        })
        .catch(err => { throw err });
}

exports.getCancelledOrders = (req, res) => {
    let _orders;
    req.seller.getOrders("Cancelled")
        .then(orders => {
            _orders = orders;
            return Order.getSellerOrdersStats(req.seller._id);
        })
        .then(orders_stats => {
            req.session.returnTo = req.originalUrl;
            req.session.save(err => {
                if (err) throw err;
                res.render('manage_orders/cancelled-orders', {
                    pageTitle: "Cancelled Orders",
                    orders: _orders,
                    orders_stats: orders_stats,
                    errorMessage: req.flash('error'),
                    successMessage: req.flash('success'),
                    warningMessage: req.flash('warning')
                })
            })
        })
        .catch(err => { throw err });
}

const createPDF = require('../services/invoice_generator').createPDF;
exports.postDownloadInvoice = (req, res) => {
    const orderId = req.body.orderId;
    req.seller.getOrder(orderId)
        .then(order => {
            if (!order || (order.status !== "Delivered")) {
                return e400_badRequest(req, res);
            } else {
                let pdfDoc = createPDF(order, req.seller);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename=Invoice_${order._id.toString()}.pdf`);
                pdfDoc.pipe(res);
                pdfDoc.end();
            }
        })
        .catch(err => { throw err });
}