const express = require('express');
const router = express.Router();

const productControllers = require('../controllers/products');
const isAuthenticated = require('../utils/middlewares/isAuthenticated').isAuthenticated;

router.get('/', productControllers.getIndexWithProducts);

router.get('/product/:productId', productControllers.getProduct);

// Filters on product
router.get('/categories', productControllers.getCategoryProducts);
router.get('/search', productControllers.getSearchProducts);

// Rate Product
router.post('/rate-product', isAuthenticated, productControllers.postRateProduct);

module.exports = router; 