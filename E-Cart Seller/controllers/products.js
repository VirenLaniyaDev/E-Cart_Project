const Product = require('../models/product');

// Helper utility
const fileOps = require('../utils/fileOperations');

exports.getAddProduct = (req, res) => {
    res.render('add-product', {
        pageTitle: "Add Product",
        errorMessage: req.flash('error'),
        successMessage: req.flash('success'),
        warningMessage: req.flash('warning')
    })
}

exports.postAddProduct = (req, res) => {
    // Parsing form data using body-parser
    const prod_title = req.body.prod_title;
    const prod_category = req.body.prod_categories;
    const prod_subCategory = req.body.prod_subCategories;
    const prod_mrp = +req.body.prod_mrp;
    const prod_sellingPrice = +req.body.prod_sellingPrice;
    const prod_quantity = +req.body.prod_quantity;
    const prod_expected_deliveryDays = +req.body.prod_delivery;
    const prod_description = req.body.prod_description;
    // Parsing input image using multer 
    const prod_image = req.file;
    const prod_image_url = prod_image.path.replace(/\\/g, '/');

    // Creating object of Product
    const product = new Product(prod_title, prod_category, prod_subCategory, prod_mrp, prod_sellingPrice, prod_quantity, prod_image_url, prod_expected_deliveryDays, prod_description, req.session.sellerId);
    product.save()  // Save data to the database
        .then(async result => {
            console.log("Product is added!");
            await req.flash('success', "Product added!");
            res.redirect('/manage-products');
        })
        .catch(err => { throw err });
}

///// Controllers for managing products /////
// Manage products
exports.getManageProducts = (req, res) => {
    Product.getSellerProducts(req.session.sellerId)
        .then(products => {
            res.render('manage_products/manage-products', {
                pageTitle: "Manage Products",
                hasProducts: products.length > 0,
                products: products,
                errorMessage: req.flash('error'),
                successMessage: req.flash('success'),
                warningMessage: req.flash('warning')
            })
        })
        .catch(err => { throw err; })
}

// View product
exports.getProductView = (req, res) => {
    const productId = req.params.productId;
    Product.getProductById(productId)
        .then(product => {
            res.render('manage_products/view-product', {
                pageTitle: "Product View",
                product: product,
                errorMessage: req.flash('error'),
                successMessage: req.flash('success'),
                warningMessage: req.flash('warning')
            })
        })
        .catch(err => { throw err; });
}

// Edit product
exports.getEditProduct = (req, res) => {
    const productId = req.params.productId;
    Product.getProductById(productId)
        .then(product => {
            res.render('manage_products/edit-product', {
                pageTitle: "Edit Product",
                product: product,
                errorMessage: req.flash('error'),
                successMessage: req.flash('success'),
                warningMessage: req.flash('warning')
            })
        })
        .catch(err => { throw err; });
}

exports.postEditProduct = (req, res) => {
    // Product id from request
    const productId = req.params.productId;
    // Parsing data from request body
    const prod_title = req.body.prod_title;
    const prod_category = req.body.prod_categories;
    const prod_subCategory = req.body.prod_subCategories;
    const prod_mrp = +req.body.prod_mrp;
    const prod_sellingPrice = +req.body.prod_sellingPrice;
    const prod_quantity = +req.body.prod_quantity;
    const prod_expected_deliveryDays = +req.body.prod_delivery;
    const prod_description = req.body.prod_description;
    // Parsing input image using multer 
    const prod_image = req.file;
    let prod_image_url;

    if (prod_image) {
        Product.getProductById(productId)
            .then(product => {
                fileOps.deleteFile(product.image);
            })
            .catch(err => { throw err })
        prod_image_url = prod_image.path.replace(/\\/g, '/');
    }
    const updated_product = new Product(prod_title, prod_category, prod_subCategory, prod_mrp, prod_sellingPrice, prod_quantity, prod_image_url, prod_expected_deliveryDays, prod_description, req.session.sellerId, productId);
    updated_product.save()
        .then(async result => {
            console.log("Product details updated!");
            await req.flash('success', "Product details updated!");
            res.redirect('/manage-products');
        })
        .catch(err => { throw err });
}

// Delete product
exports.postDeleteProduct = (req, res) => {
    // Product id from req params
    const productId = req.params.productId;
    Product.deleteProductById(productId)
        .then(async result => {
            console.log("Product is deleted!");
            await req.flash('warning', "Product is deleted!");
            res.redirect('/manage-products');
        })
        .catch(err => { throw err });
}