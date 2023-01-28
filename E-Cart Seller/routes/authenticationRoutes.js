const express = require('express');
const router = express.Router();

const validation = require('../utils/validation');

// Importing controllers
const authControllers = require('../controllers/authentication.js');

// Signup routes
router.get('/signup', authControllers.getSignup);
router.post('/signup', validation.signupValidation, authControllers.postSignup);

// Login routes
router.get('/login', authControllers.getLogin);
router.post('/login', validation.loginValidation, authControllers.postLogin);

// Reset Password routes
router.get('/forgot-password', authControllers.getForgotPassword);
router.post('/forgot-password', authControllers.postForgotPassword);
router.get('/reset-password/:token', authControllers.getResetPassword);
router.post('/reset-password', authControllers.postResetPassword);

router.post('/signout', authControllers.postSignout);

module.exports = router;