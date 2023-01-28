const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const Seller = require('../models/seller').Seller;

const fileOps = require('../utils/fileOperations');

exports.getIndex = (req, res) => {
    req.seller.getSellerOverview()
        .then(sellerOverview => {
            res.render('index', {
                pageTitle: "Home",
                sellerOverview: sellerOverview,
                errorMessage: req.flash('error'),
                successMessage: req.flash('success'),
                warningMessage: req.flash('warning')
            })
        })
        .catch(err => { throw err });

}

exports.postSellerOverview = (req, res) => {
    req.seller.getSellerChartData()
        .then(sellerChartData => {
            return res.status(200).send(sellerChartData[0]);
        })
        .catch(err => { throw err });
}

//// Manage Profile ////
exports.getProfile = (req, res) => {
    res.render('manage_profile/profile.ejs', {
        pageTitle: "My Profile",
        seller: req.seller,
        errorMessage: req.flash('error'),
        successMessage: req.flash('success'),
        warningMessage: req.flash('warning')
    })
}

exports.getEditProfile = (req, res) => {
    res.render('manage_profile/edit-profile.ejs', {
        pageTitle: "Edit Profile",
        seller: req.seller,
        errorMessage: req.flash('error'),
        successMessage: req.flash('success'),
        warningMessage: req.flash('warning'),
        previousInput: {},
        validationErrors: []
    })
}

exports.postEditProfile = (req, res) => {
    const sellerId = req.session.sellerId;

    const sellerName = req.body.seller_name;
    const sellerEmail = req.body.seller_email;
    const sellerMobile = req.body.seller_mobile;
    const aboutSeller = req.body.about_seller;
    const businessName = req.body.business_name;
    const businessGSTIN = req.body.business_gstin;
    const businessAddress = req.body.business_address;
    const bankName = req.body.bank_name;
    const bankAccount = req.body.bank_account;
    const bankIFSC = req.body.bank_IFSC;

    const profilePicture = req.file;

    //--- Validation area
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let errorMessage = [errors.array()[0].msg]
        return res.status(422).render('manage_profile/edit-profile.ejs', {
            pageTitle: "Edit Profile",
            seller: req.seller,
            errorMessage: errorMessage,
            successMessage: [],
            warningMessage: [],
            previousInput: {
                seller_name: sellerName,
                seller_email: sellerEmail,
                seller_mobile: sellerMobile,
                about_seller: aboutSeller,
                business_name: businessName,
                business_gstin: businessGSTIN,
                business_address: businessAddress,
                bank_name: bankName,
                bank_account: bankAccount,
                bank_IFSC: bankIFSC
            },
            validationErrors: errors.array()
        })
    }
    //--- 
    else {
        let profilePictureURL;
        if (profilePicture) {
            if (req.seller.profilePicture)
                fileOps.deleteFile(req.seller.profilePicture);
            profilePictureURL = profilePicture.path.replace(/\\/g, '/');
        }

        const seller = new Seller(sellerName, businessName, sellerMobile, sellerEmail, null, aboutSeller, businessGSTIN, businessAddress, bankName, bankAccount, bankIFSC, profilePictureURL, sellerId);
        seller.save()
            .then(async result => {
                console.log("Seller profile updated!");
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
    bcrypt.compare(oldPassword, req.seller.password)
        .then(async doMatch => {
            if (doMatch) {
                // 2. After successfully match hashed password is generated
                bcrypt.hash(newPassword, 12)
                    .then(hashedPassword => {
                        // 3. Updating password
                        return req.seller.updatePassword(hashedPassword);
                    })
                    .then(result => {
                        console.log("Password updated!");
                        req.flash('success', "Password updated!");
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