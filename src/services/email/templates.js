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

    getHTML({ firstName, password, link }) {
        const isProd = NODE_ENV === 'production';
        const loginLink = isProd ? 'https://www.karly-capstone.com' : 'https://karly-capstone.dev:3000';
        const fullLink = loginLink + '/magic?' + link;
        return `
            Hi ${ firstName },
            <br>
            <br>
            Below you will find your password. This password will expire within 7 days.
            <br>
            <br>
            <code>${password}</code>
            <br>
            <br>
            Click <a href="${ loginLink }/login" target="_blank">here</a> to login, or click <a href="${ fullLink }" target="_blank">here</a> to log in using a 1-time link.
        `;
    }
};

module.exports = {
    requestAccessTmpl: new RequestAccess()
};