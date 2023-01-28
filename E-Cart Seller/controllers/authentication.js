const bcrypt = require('bcryptjs');     // Bcryptjs used for Generating hashed string
const crypto = require('crypto');   // Crypto used for generate random bytes
const { validationResult } = require('express-validator');

const sendMail = require('../services/send_mail');

const Seller = require('../models/seller').Seller;
const SellerResetPassword = require('../models/seller').SellerResetPassword;

exports.getSignup = (req, res) => {
    res.render('authentication/signup.ejs', {
        pageTitle: "Sign Up",
        errorMessage: req.flash('error'),
        successMessage: req.flash('success'),
        warningMessage: req.flash('warning'),
        previousInput: {},
        validationErrors: []
    });
}

exports.postSignup = (req, res) => {
    // Parsing data from signup form using body-parser
    const name = req.body.sname;
    const bus_name = req.body.bname;
    const mobile = req.body.mobile;
    const email = req.body.email;
    const password = req.body.password;


    //--- Validation area
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let errorMessage = [errors.array()[0].msg];
        return res.status(422).render('authentication/signup.ejs', {
            pageTitle: "Sign Up",
            errorMessage: errorMessage,
            successMessage: [],
            warningMessage: [],
            previousInput: {
                sname: name,
                bname: bus_name,
                mobile: mobile,
                email: email,
                password: password
            },
            validationErrors: errors.array()
        })
    }
    //---
    else {
        return bcrypt.hash(password, 12)
            // .hash(password string, salt: number of round for hash (12 is most secure currently)) And it will return the promise
            .then(hashedPassword => {
                const seller = new Seller(name, bus_name, mobile, email, hashedPassword);
                seller.save();
            })
            .then(async result => {
                console.log("Approved : You have successfully signed up!");
                await req.flash('success', "You have Successfully signed up!");
                res.redirect('/login');
                return sendMail.signupSucceeded(email, name, bus_name, mobile.substring(6,));
            })
            .then(result => {
                console.log("Signed up : Mail sent!");
            })
            .catch(err => { throw err });
    }
}

exports.getLogin = (req, res) => {
    res.render('authentication/login.ejs', {
        pageTitle: "Login",
        errorMessage: req.flash('error'),
        successMessage: req.flash('success'),
        warningMessage: req.flash('warning'),
        previousInput: {},
        errorField: ""
    });
}

exports.postLogin = (req, res) => {
    // Parsing data from signup form using body-parser
    const email = req.body.email;
    const password = req.body.password;

    Seller.findByEmail(email.toLowerCase())
        .then(seller => {
            if (!seller) {
                console.log("Denied : Email is not registered!");
                return res.status(422).render('authentication/login.ejs', {
                    pageTitle: "Login",
                    errorMessage: ["Email is not registered!"],
                    successMessage: [],
                    warningMessage: [],
                    previousInput: {
                        email: email,
                        password: password
                    },
                    errorField: "email"
                });
            }
            bcrypt.compare(password, seller.password)
                .then(async doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.sellerId = seller._id;
                        // Creation of session takes some couple of time for synchronized task use save() of session
                        let returnTo = req.session.returnTo;
                        let requestMethod = req.session.method;
                        delete req.session.returnTo;
                        delete req.session.method;
                        return req.session.save(async err => {
                            if (err)
                                throw err;
                            console.log("Approved : You have logged in!");
                            let requestMethodCode = requestMethod == "POST" ? 307 : 303;
                            await req.flash('success', `Welcome, ${seller.name}`);
                            res.redirect(requestMethodCode, returnTo || '/');
                        })
                    }
                    else {
                        console.log("Denied : Invalid credentials!");
                        return res.status(422).render('authentication/login.ejs', {
                            pageTitle: "Login",
                            errorMessage: ["Invalid Password!"],
                            successMessage: [],
                            warningMessage: [],
                            previousInput: {
                                email: email,
                                password: ""
                            },
                            errorField: "password"
                        });
                    }
                })
                .catch(err => { throw err; });
        })
        .catch(err => { throw err; });
}

exports.getForgotPassword = (req, res) => {
    res.render('authentication/forgot-password.ejs', {
        pageTitle: "Forgot Password",
        errorMessage: req.flash('error'),
        successMessage: req.flash('success'),
        warningMessage: req.flash('warning')
    })
}

exports.postForgotPassword = (req, res) => {
    const email = req.body.email;
    Seller.findByEmail(email)
        .then(async seller => {
            if (!seller) {
                console.log("Denied : Email is not Registered!");
                await req.flash('error', "Email is not registered!");
                return res.redirect('/forgot-password');
            }
            crypto.randomBytes(32, (err, buffer) => {
                if (err) {
                    console.log(err);
                    return res.redirect('/forgot-password');
                }
                const token = buffer.toString('hex');
                const sellerResetPassword = new SellerResetPassword(token, seller._id);
                sellerResetPassword.setResetPassToken()
                    .then(result => {
                        console.log("Reset token has been settled!");
                        return sendMail.resetPassword(email, seller.name, token);
                    })
                    .then(async result => {
                        console.log("Reset Password : Mail Sent!");
                        await req.flash('success', "Link sent for Reset password via mail!");
                        res.redirect('/login');
                    })
                    .catch(err => { throw err });
            })
        })
        .catch(err => { throw err })
}

exports.getResetPassword = (req, res) => {
    const token = req.params.token;
    SellerResetPassword.getResetPassToken(token)
        .then(async resetTokenRecord => {
            if (!resetTokenRecord) {
                console.log("Link is expired!");
                await req.flash('error', "Link is expired!");
                return res.redirect('/forgot-password');
            }
            res.render('authentication/reset-password', {
                pageTitle: "Reset Password",
                sellerId: resetTokenRecord.sellerId.toString(),
                errorMessage: req.flash('error'),
                successMessage: req.flash('success'),
                warningMessage: req.flash('warning')
            })
        })
        .catch(err => { throw err });
}

exports.postResetPassword = (req, res) => {
    const sellerId = req.body.sellerId;
    const new_password = req.body.new_password;

    //1. Find seller by seller id
    Seller.findBySellerId(sellerId)
        .then(async seller => {
            if (!seller) {
                console.log("Try again! Request denied.");
                await req.flash('error', "Try again! Request denied.");
                return res.redirect('/forgot-password');
            }
            // 2. Applying hash to new password
            bcrypt.hash(new_password, 12)
                .then(hashedPassword => {
                    // 3. Set new password to the database
                    return SellerResetPassword.resetPassword(hashedPassword, sellerId);
                })
                .then(result => {
                    console.log("Password updated!");
                    return SellerResetPassword.deleteResetPassToken(sellerId);
                })
                .then(async () => {
                    await req.flash('success', "Password updated!");
                    res.redirect('/login');
                })
                .catch(err => { throw err });

        })
        .catch(err => { throw err });
}

exports.postSignout = (req, res) => {
    req.session.destroy(err => {
        if (err)
            throw err;
        console.log("Approved : You have successfully logged out!");
        res.redirect('/login');
    })
}