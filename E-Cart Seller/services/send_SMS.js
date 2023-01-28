const SMS_service = require('../configurations/appConfig.json').SMS_service;

const accountSid = SMS_service.twilio_sid;
const authToken = SMS_service.twilio_auth_token;
const client = require("twilio")(accountSid, authToken);


exports.confirmDelivery = (otp, mobile) => {
    return client.messages
        .create({ 
            body: "Please verify your delivery.\nYour OTP for confirm delivery is : "+otp, 
            from: "+13854626122", 
            to: "+91"+mobile 
        })
}