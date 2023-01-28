const { check, body } = require('express-validator');

const Seller = require('../models/seller').Seller;

exports.signupValidation = [
    //--- 1. Mobile Validation
    check('mobile', "Mobile number should be 10 digits!").isLength({ min: 10, max: 10})
        .custom((value, { req }) => {
            return Seller.findByMobile(value)
                .then(seller => {
                    if (seller) {
                        return Promise.reject("Mobile number already registered!");
                    }
                    return true;
                })
        }),

    //--- 2. Email Validation
    // check('email').isEmail().withMessage("Please enter valid Email!").normalizeEmail()
    // OR
    check('email', "Please enter valid Email!").isEmail().normalizeEmail()
        .custom((value, { req }) => {
            return Seller.findByEmail(value)
                .then(seller => {
                    if (seller) {
                        return Promise.reject("Email already registered!");
                    }
                    return true;
                })
        }),

    //--- 3. Password Validation
    check('password', "Password should at least 6 character long!").isLength({ min: 6 })
];

exports.loginValidation = [
    //--- 1. Check whether email is valid or not
    check('email', "Please enter valid Email!").isEmail().normalizeEmail()
]

exports.updateProfileValidation = [
    //--- 1. Email Validation
    check('seller_email', "Please enter valid Email!").isEmail().normalizeEmail()
        .custom((value, { req }) => {
            return Seller.findByEmail(value)
                .then(seller => {
                    if (seller && (seller._id.toString() !== req.seller._id.toString())) {
                        return Promise.reject("Email already in use!");
                    }
                    return true;
                })
        }),

    //--- 2. Mobile Validation
    check('seller_mobile', "Mobile number should be 10 digits!").isLength({ min: 10, max: 10})
        .custom((value, { req }) => {
            return Seller.findByMobile(value)
                .then(seller => {
                    if (seller && (seller._id.toString() !== req.seller._id.toString())) {
                        return Promise.reject("Mobile number already registered!");
                    }
                    return true;
                })
        })
]