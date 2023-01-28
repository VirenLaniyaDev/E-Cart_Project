const { check, body } = require('express-validator');

const User = require('../models/user').User;

exports.signupValidation = [
    //--- 1. Email Validation
    check('email', "Please enter valid Email!").isEmail().normalizeEmail()
        .custom((value, { req }) => {
            return User.findByEmail(value)
                .then(user => {
                    if (user) {
                        return Promise.reject("Email already registered!");
                    }
                    return true;
                })
        }),

    //--- 2. Password Validation
    check('password', "Password should at least 6 character long!").isLength({ min: 6 })
];

exports.loginValidation = [
    //--- 1. Check whether email is valid or not
    check('email', "Please enter valid Email!").isEmail().normalizeEmail()
]

exports.updateProfileValidation = [
    //--- 1. Email Validation 
    // check('user_email').isEmail().withMessage("Please enter valid Email!").normalizeEmail()
    // Or
    check('user_email', "Please enter valid Email!").isEmail().normalizeEmail()
        .custom((value, { req }) => {
            return User.findByEmail(value)
                .then(user => {
                    if (user && (user._id.toString() !== req.user._id.toString())) {
                        return Promise.reject("Email already in use!");
                    }
                    return true;
                })
        }),

    //--- 2. Mobile Validation
    check('user_mobile', "Mobile number should be 10 digits!").isLength({ min: 10, max: 10})
        .custom((value, { req }) => {
            return User.findByMobile(value)
                .then(user => {
                    if (user && (user._id.toString() !== req.user._id.toString())) {
                        return Promise.reject("Mobile number already registered!");
                    }
                    return true;
                })
        })
]

exports.changeMobileValidation = [
    //--- 1. Mobile Validation
    check('mobile', "Mobile number should be 10 digits!").isLength({ min: 10, max: 10})
        .custom((value, { req }) => {
            return User.findByMobile(value)
                .then(user => {
                    if (user && (user._id.toString() !== req.user._id.toString())) {
                        return Promise.reject("Mobile number already registered!");
                    }
                    return true;
                })
        })
]