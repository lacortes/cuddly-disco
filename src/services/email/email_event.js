const { requestAccessTmpl } = require('./templates');

class Event {

    static RequestAccess = new Event('RequestAccess', requestAccessTmpl);


    constructor(name, template) {
        this.name = name;
        this.template = template;
    }

    getTmpl() {
        return this.template;
    }

};

module.exports = Event;