const mailService = require('../configurations/appConfig.json').mail_service;   // Importing configurations for mail service
// Import the sendgrid package that provides functionality for sending mail
const sendgridMail = require('@sendgrid/mail');

const API_KEY = mailService.sg_ecart_api_key;
sendgridMail.setApiKey(API_KEY);    // Setting up the API key

exports.signupSucceeded = (email, name) => {
    return sendgridMail.send({
        to: email,
        from: mailService.ecart_email,
        templateId: mailService.signupSucceeded_templateId,
        dynamicTemplateData: {
            name: name
        }
    })
}

exports.resetPassword = (email, name, token)=>{
    return sendgridMail.send({
        to: email,
        from: mailService.ecart_email,
        templateId: mailService.resetPassword_templateId,
        dynamicTemplateData: {
            name: name,
            reset_password_url: `http://localhost:3000/reset-password/${token}`
        }
    })
}