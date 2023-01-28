const bcrypt = require('bcryptjs'); // Bcryptjs used for Generating hashed string
const crypto = require('crypto'); // Crypto used for generating random bytes
const { validationResult } = require('express-validator');

const sendMail = require('../services/send_mail');

const User = require('../models/user').User;
const UserResetPassword = require('../models/user').UserResetPassword;

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
    const name = req.body.uname;
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
                uname: name,
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
                const new_user = new User(name, email, hashedPassword, { items: [] });
                new_user.save();
            })
            .then(async result => {
                console.log("Approved : You have successfully signed up!");
                await req.flash('success', "You have Successfully signed up!");
                res.redirect('/login');
                return sendMail.signupSucceeded(email, name);
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

    User.findByEmail(email)
        .then(user => {
            if (!user) {
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
            bcrypt.compare(password, user.password)
                .then(async doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.userId = user._id;
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
                            await req.flash('success', `Welcome, ${user.name}`);
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
    User.findByEmail(email)
        .then(async user => {
            if (!user) {
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
                const userResetPassword = new UserResetPassword(token, user._id);
                userResetPassword.setResetPassToken()
                    .then(result => {
                        console.log("Reset token has been settled!");
                        return sendMail.resetPassword(email, user.name, token);
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
    UserResetPassword.getResetPassToken(token)
        .then(async resetTokenRecord => {
            if (!resetTokenRecord) {
                console.log("Link is expired!");
                await req.flash('error', "Link is expired!");
                return res.redirect('/forgot-password');
            }
            res.render('authentication/reset-password', {
                pageTitle: "Reset Password",
                userId: resetTokenRecord.userId.toString(),
                errorMessage: req.flash('error'),
                successMessage: req.flash('success'),
                warningMessage: req.flash('warning')
            })
        })
        .catch(err => { throw err });
}

exports.postResetPassword = (req, res) => {
    const userId = req.body.userId;
    const new_password = req.body.new_password;

    //1. Find User by user id
    User.findByUserId(userId)
        .then(async user => {
            if (!user) {
                console.log("Try again! Request denied.");
                await req.flash('error', "Try again! Request denied.");
                return res.redirect('/forgot-password');
            }
            // 2. Applying hash to new password
            bcrypt.hash(new_password, 12)
                .then(hashedPassword => {
                    // 3. Set new password to the database
                    return UserResetPassword.resetPassword(hashedPassword, userId);
                })
                .then(result => {
                    console.log("Password updated!");
                    req.flash('success', "Password updated!");
                    return UserResetPassword.deleteResetPassToken(userId);
                })
                .then(() => {
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
        res.redirect('/');
    })
}