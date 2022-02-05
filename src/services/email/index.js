const makeEmailList = require('./email_list');
const makeEmailValidator = require('./email_validator');
const makeEmailService = require('./email_service');
const emailZeroBounce = require('./email_zero_bounce');
const emailKey = require('../../config/app').email_key;
const MongoDB = require('../../db');
const log = require('../../utils/logger');
const nodemailer = require('nodemailer');
const axios = require('../../utils/axiosHTTP');

const emailTransport = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'karly-capstone@outlook.com',
        pass: '******'
    }
});

const emailList = makeEmailList({ db: MongoDB, log });

const validateEmail = emailZeroBounce({ log, axios, emailKey });
const emailValidator = makeEmailValidator({ validateEmail });
const emailService = makeEmailService({ log, transporter:  emailTransport });

module.exports = { 
    emailList: emailList(),
    emailValidator: emailValidator(),
    emailService: emailService(),
};