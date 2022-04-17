const makeEmailList = require('./email_list');
const makeEmailValidator = require('./email_validator');
const makeEmailService = require('./email_service');
const makeEmailService2 = require('./email_service_2');
const emailZeroBounce = require('./email_zero_bounce');
const { EMAIL_KEY, AWS_SES_FROM } = require('../../config/app');
const MongoDB = require('../../db');
const log = require('../../utils/logger');
const nodemailer = require('nodemailer');
const axios = require('../../utils/axiosHTTP');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const aws = require('@aws-sdk/client-ses');

const ses = new aws.SES({
    region: 'us-west-1',
    credentials: defaultProvider(),
    tls: true
});

const emailTransport = nodemailer.createTransport({
    SES: { aws, ses },
    sendingRate: 14 // msgs / second
});

const emailList = makeEmailList({ db: MongoDB, log });

const validateEmail = emailZeroBounce({ log, axios, emailKey: EMAIL_KEY });
const emailValidator = makeEmailValidator({ validateEmail });
// const emailService = makeEmailService({ log, transporter:  emailTransport, emailFrom:AWS_SES_FROM });
const emailService = makeEmailService2({ log, ses, emailFrom: AWS_SES_FROM });

module.exports = { 
    emailList: emailList(),
    emailValidator: emailValidator(),
    emailService: emailService(),
};