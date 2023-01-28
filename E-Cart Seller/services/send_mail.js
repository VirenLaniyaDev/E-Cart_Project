const mailService = require('../configurations/appConfig.json').mail_service;   // Importing configurations for mail service
// Import the sendgrid package that provides functionality for sending mail
const sendgridMail = require('@sendgrid/mail');

const API_KEY = mailService.sg_ecart_api_key;
sendgridMail.setApiKey(API_KEY);    // Setting up the API key

exports.signupSucceeded = (email, name, bname, mobile_last4digit) => {
    return sendgridMail.send({
        to: email,
        from: mailService.ecartSeller_email,
        templateId: mailService.signupSucceeded_templateId,
        dynamicTemplateData: {
            name: name,
            bname: bname,
            mobile_last4digit: mobile_last4digit
        }
    })
}

exports.resetPassword = (email, name, token) => {
    return sendgridMail.send({
        to: email,
        from: mailService.ecartSeller_email,
        templateId: mailService.resetPassword_templateId,
        dynamicTemplateData: {
            name: name,
            reset_password_url: `http://localhost:3001/reset-password/${token}`
        }
    })
}

exports.orderDelivered = (order) => {
    let orderId = order._id.toString();
    return sendgridMail.send({
        to: order.user.email,
        from: mailService.ecartSeller_email,
        templateId: mailService.orderDelivered_templateId,
        dynamicTemplateData: {
            name: order.user.name,
            delivered_order_url: `http://localhost:3000/order/${orderId}`,
            orderId: orderId
        }
    })
}