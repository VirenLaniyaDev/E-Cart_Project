const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/user').User;

// Importing middleware for file operations
const fileOps = require('../utils/helpers/fileOperations');

exports.getProfile = (req, res) => {
    res.render('manage_profile/profile.ejs', {
        pageTitle: "My Profile",
        user: req.user,
        errorMessage: req.flash('error'),
        successMessage: req.flash('success'),
        warningMessage: req.flash('warning')
    })
}

exports.getEditProfile = (req, res) => {
    res.render('manage_profile/edit-profile.ejs', {
        pageTitle: "Edit Profile",
        user: req.user,
        errorMessage: req.flash('error'),
        successMessage: req.flash('success'),
        warningMessage: req.flash('warning'),
        previousInput: {},
        validationErrors: []
    })
}

exports.postEditProfile = (req, res) => {
    const userId = req.session.userId;

    const userName = req.body.user_name;
    const userEmail = req.body.user_email;
    const userMobile = req.body.user_mobile;
    const userGender = req.body.user_gender;
    const address = req.body.address;

    const profilePicture = req.file;

    //--- Validation area
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let errorMessage = [errors.array()[0].msg]
        return res.status(422).render('manage_profile/edit-profile.ejs', {
            pageTitle: "Edit Profile",
            user: req.user,
            errorMessage: errorMessage,
            successMessage: [],
            warningMessage: [],
            previousInput: {
                user_name: userName,
                user_email: userEmail,
                user_mobile: userMobile,
                user_gender: userGender,
                address: address
            },
            validationErrors: errors.array()
        })
    }
    else {
        let profilePictureURL;
        if (profilePicture) {
            if (req.user.profilePicture)
                fileOps.deleteFile(req.user.profilePicture);
            profilePictureURL = profilePicture.path.replace(/\\/g, '/');
        }

        const user = new User(userName, userEmail, null, null, address, userMobile, userGender, profilePictureURL, userId);
        user.save()
            .then(async result => {
                console.log("User profile updated!");
                await req.flash('success', "Profile updated!");
                res.redirect('/profile');
            })
            .catch(err => { throw err });
    }
}

exports.getChangePassword = (req, res) => {
    res.render('manage_profile/change-password', {
        pageTitle: "Change password",
        errorMessage: req.flash('error'),
        successMessage: req.flash('success'),
        warningMessage: req.flash('warning')
    })
}

exports.postChangePassword = (req, res) => {
    const oldPassword = req.body.old_password;
    const newPassword = req.body.new_password;

    // 1. Comparing old password value with stored password
    bcrypt.compare(oldPassword, req.user.password)
        .then(async doMatch => {
            if (doMatch) {
                // 2. After successfully match hashed password is generated
                bcrypt.hash(newPassword, 12)
                    .then(hashedPassword => {
                        // 3. Updating password
                        return req.user.updatePassword(hashedPassword);
                    })
                    .then(async result => {
                        console.log("Password updated!");
                        await req.flash('success', "Password updated!");
                        res.redirect('/profile');
                    })
                    .catch(err => { throw err });
            } else {
                console.log('Denied : Old password is Invalid!');
                await req.flash('error', "Please enter valid Old password!");
                res.redirect('/change-password');
            }
        })
        .catch(err => { throw err });
}

exports.postChangeAddress = (req, res) => {
    const delivery_address = req.body.delivery_address;
    req.user.updateAddress(delivery_address)
        .then(async result => {
            console.log("Address is changed!");
            await req.flash('success', "Address is updated!");
            res.redirect(req.session.returnTo || '/cart');
        })
        .catch(err => { throw err });
}

exports.postChangeMobile = (req, res) => {
    const mobile = req.body.mobile;
    //--- Validation area
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg)
        return res.status(422).redirect(req.session.returnTo || '/cart');
    }
    //---
    else {
        req.user.updateMobile(mobile)
            .then(async result => {
                console.log("Mobile is changed!");
                await req.flash('success', "Mobile number is updated!");
                res.redirect(req.session.returnTo || '/cart');
            })
            .catch(err => { throw err });
    }
}