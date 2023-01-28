const express = require('express');
const router = express.Router();

const sellerControllers = require('../controllers/sellers.js');    // Importing Sellers controller
const productsControllers = require('../controllers/products.js');    // Importing Products controller
const orderControllers = require('../controllers/orders.js');   // Importing Orders controllers
const isAuthenticated = require('../utils/middlewares/isAuthenticated.js').isAuthenticated; // Importing isAuthenticated middleware
const validation = require('../utils/validation');

const fileUpload = require('../utils/middlewares/fileUpload_multer');

//// Index routes ////
router.get('/', isAuthenticated, sellerControllers.getIndex);
router.post('/index/seller-overview', isAuthenticated, sellerControllers.postSellerOverview);

//// Add Product routes ////
router.get('/add-product', isAuthenticated, productsControllers.getAddProduct);
router.post('/add-product', isAuthenticated, fileUpload.fileUpload('prod_image', 'product_Images'), productsControllers.postAddProduct);

//// Routes for managing products ////
router.get('/manage-products', isAuthenticated, productsControllers.getManageProducts);
// :productId captures the product ID value. Path will be something like that /products/123445
router.get('/manage-products/view/:productId', isAuthenticated, productsControllers.getProductView);
router.get('/manage-products/edit/:productId', isAuthenticated, productsControllers.getEditProduct);
router.post('/manage-products/edit/:productId', isAuthenticated, fileUpload.fileUpload('prod_image', 'product_Images'), productsControllers.postEditProduct);
router.post('/manage-products/delete/:productId', isAuthenticated, productsControllers.postDeleteProduct);

//// Routes for managing profile ////
router.get('/profile', isAuthenticated, sellerControllers.getProfile);
router.get('/edit-profile', isAuthenticated, sellerControllers.getEditProfile);
router.post('/edit-profile', isAuthenticated, fileUpload.fileUpload('change_profile_img', 'profile_Pictures'), validation.updateProfileValidation, sellerControllers.postEditProfile);
router.get('/change-password', isAuthenticated, sellerControllers.getChangePassword);
router.post('/change-password', isAuthenticated, sellerControllers.postChangePassword);

//// Routes for managing orders ////
router.get('/orders/order-requests', isAuthenticated, orderControllers.getOrderRequests);
router.get('/orders/shipped-orders', isAuthenticated, orderControllers.getShippedOrders);
router.get('/orders/delivered-orders', isAuthenticated, orderControllers.getDeliveredOrders);
router.get('/orders/cancelled-orders', isAuthenticated, orderControllers.getCancelledOrders);
router.get('/orders/:orderId', isAuthenticated, orderControllers.getOrder);
router.post('/cancel-order', isAuthenticated, orderControllers.postCancelOrder);
router.post('/ship-order', isAuthenticated, orderControllers.postShipOrder);
router.post('/confirm-delivery', isAuthenticated, orderControllers.postConfirmDelivery);
router.post('/verify-otp', isAuthenticated, orderControllers.postVerifyOTP);
router.post('/order-delivered', isAuthenticated, orderControllers.postOrderDelivered);
router.post('/order/download-invoice', isAuthenticated, orderControllers.postDownloadInvoice);

module.exports = router;