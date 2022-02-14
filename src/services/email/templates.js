const { NODE_ENV } = require('../../config/app');
class Template {

    constructor(subject) {
        this.subject = subject;
    }

    getHTML({}) {
        return '';
    }

    getSubject() {
        return this.subject;
    }
    
    get(context) {
        return Object.freeze({
            subject: this.getSubject(),
            html: this.getHTML(context),
        });
    }
};

class RequestAccess extends Template {

    constructor() {
        super("Karly-Capstone Password");
    }

    getHTML({ firstName, password }) {
        const isProd = NODE_ENV === 'production';
        const loginLink = isProd ? 'https://www.karly-capstone.com' : 'http://localhost:3010';
        return `
            Hi ${ firstName },
            <br>
            <br>
            Below you will find your password. This password will expire within <b>7 days</b>.
            <br>
            <br>
            <code>${password}</code>
            <br>
            <br>
            Click <a href="${ loginLink }/login" target="_blank">here</a> to login.
        `;
    }
};

module.exports = {
    requestAccessTmpl: new RequestAccess()
};