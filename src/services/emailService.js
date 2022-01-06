const nodemailer = require('nodemailer');
const appConfig = require('../config/app');
const log = require('../utils/logger');
const axios = require('../utils/axiosHTTP');

class EmailService {
    constructor() {
        log.info("initializing email...");

        this.emailKey = appConfig.email_key;
        this.transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                user: 'karly-capstone@outlook.com',
                pass: 'Numb3r#3'
            }
        });
    }

    async sendEmail(to='') {
        if (!to || to.length <= 0) {
            return;
        }

        try {
            let info = await this.transporter.sendMail({
                from: '"Fred Foo" <karly-capstone@outlook.com>',
                to: "cortes72luis@gmail.com",
                subject: "Hello",
                text: "Hello World!",
                html: "<b>Hello World</b>"
            });
        } catch (err) {
            log.error(`Email Error : ${ err }`);
        }
        
    }

    async validateEmailAddress(email) {
        try {
            const resp = await axios.get(`https://api.zerobounce.net/v2/validate?api_key=${ this.emailKey }&email=${ email }&ip_address=`);
            
            const data = resp?.data;
            if (!data || data.error) {
                log.debug(`Unable to validate email: ${ data }`);
                return null;
            }
            log.debug(typeof data);
            const obj = { email, emailStatus: data.status, isValid: data.status === 'valid' };
            log.debug(obj);
            return obj;
        } catch (err) {
            log.error(`Failed to validate email: ${ email }. ${ err }`);
        }
        return null;
    }
}

module.exports = new EmailService();