const MongoDB = require('../db');
const log = require('../utils/logger');

class UserWaitlist {
    constructor() {
        this.waitlist = new Map();
    }

    async get(email) {
        if(this.waitlist.has(email)) {
            return this.waitlist.get(email);
        }

        const userDB = await MongoDB.findOne("capstone", "user_waitlist", { email });
        
        if (userDB) {
            log.debug('Adding email to cache');
            this.waitlist.set(email, userDB);
        }
        return this.waitlist.get(email);
    }

    async isInWaitlist(email) {
        return await this.get(email) !== null;
    }

    async add(emailValidation) {
        const { email, isValid, emailStatus } = emailValidation;
        if (!email || isValid === undefined || !emailStatus) {
            return false;
        }

        const emailDB = await MongoDB.insertOne(
            "capstone", 
            "user_waitlist", {
                email, 
                isValid,
                emailStatus,
                signUpDate: Date.now(),
                lastNotifiedAt: null
            }
        );
        
        if (!emailDB) {
            return false;
        }

        this.waitlist.set(email, isValid);

        return true;
    }
}

module.exports = new UserWaitlist();