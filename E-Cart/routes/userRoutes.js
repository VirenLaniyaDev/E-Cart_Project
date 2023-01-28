const express = require('express');
const router = express.Router();

const userControllers = require('../controllers/users');
const cartControllers = require('../controllers/cart');
const orderControllers = require('../controllers/orders');

const isAuthenticated = require('../utils/middlewares/isAuthenticated').isAuthenticated;
const fileUpload = require('../utils/middlewares/fileUpload_multer');
const validation = require('../utils/validation');

//// Routes for managing profile ////
router.get('/profile', isAuthenticated, userControllers.getProfile);
router.get('/edit-profile', isAuthenticated, userControllers.getEditProfile);
router.post('/edit-profile', isAuthenticated, fileUpload.fileUpload('change_profile_img', 'profile_Pictures'), validation.updateProfileValidation, userControllers.postEditProfile);
router.get('/change-password', isAuthenticated, userControllers.getChangePassword);
router.post('/change-password', isAuthenticated, userControllers.postChangePassword);

//// Routes for user cart ////
router.post('/add-to-cart/:productId', isAuthenticated, cartControllers.postAddToCart);
router.get('/cart', isAuthenticated, cartControllers.getCart);
router.post('/cart/prod-qnty-decrement', isAuthenticated, cartControllers.postQntyDecrement);
router.post('/cart/prod-qnty-increment', isAuthenticated, cartControllers.postQntyIncrement);
router.post('/cart/remove-product', isAuthenticated, cartControllers.postRemoveCartProduct);

router.post('/change-address', isAuthenticated, userControllers.postChangeAddress);
router.post('/change-mobile', isAuthenticated, validation.changeMobileValidation, userControllers.postChangeMobile);

const payment = require('../utils/middlewares/payment');
//// Routes for user Order ////
router.get('/cart/checkout', isAuthenticated, orderControllers.getCartCheckout);
router.post('/checkout/decrease-prod-quantity', isAuthenticated, orderControllers.checkout_qntyDecrement);
router.post('/checkout/increment-prod-quantity', isAuthenticated, orderControllers.checkout_qntyIncrement);
router.post('/checkout/remove-product', isAuthenticated, orderControllers.checkout_remove);
router.post('/place-order', isAuthenticated, payment, orderControllers.postPlaceOrder);
router.get('/orders', isAuthenticated, orderControllers.getOrders);
router.get('/order/:orderId', isAuthenticated, orderControllers.getOrder);
router.post('/cancel-order', isAuthenticated, orderControllers.postCancelOrder);
router.post('/order/download-invoice', isAuthenticated, orderControllers.postDownloadInvoice);

//// Routes for direct buy ////
router.get('/checkout/:productId', isAuthenticated, orderControllers.getDirectProdCheckout);

module.exports = router;