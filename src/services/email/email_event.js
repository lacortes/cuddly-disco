const { requestAccessTmpl } = require('./templates');

class Event {

    static RequestAccess = new Event('RequestAccess', requestAccessTmpl, 'Password-Email');


    constructor(name, template, sesTmplName) {
        this.name = name;
        this.template = template;
        this.sesTmplName = sesTmplName;
    }

    getTmpl() {
        return this.template;
    }

    getSESTmplName() {
        return this.sesTmplName;
    }

};

module.exports = Event;