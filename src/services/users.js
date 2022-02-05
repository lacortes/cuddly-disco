const bcrypt = require('bcrypt');
const MongoDB = require('../db');
const log = require('../utils/logger');

class UserService {
    constructor() {
        this.users = new Map();
    }

    async get(email) {
        if (this.users.has(email)) {
            return this.users.get(email);
        }

        const userDB = await this.getUserDB(email);
        if (userDB) {
            this.users.set(email, userDB);
        }
        return userDB;
    }

    async getUserDB(email) {
        return await MongoDB.findOne("capstone", "user", { email });
    }

    async userExists(email) {
        return await this.getUserDB(email) !== null;
    }

    async createUser(email, firstName, lastName, pass) { 
        if (!pass || !email || !firstName || !lastName) {
            return false;
        }

        const exists = await this.userExists(email);
        if (exists) {
            return false;
        }
        
        const salt = await bcrypt.genSalt();
        const hashed = await bcrypt.hash(pass, salt);

        const userRecord = {
            email,
            hashedPass: hashed,
            passCreated: Date.now()
        };
        
        const userDB = await MongoDB.insertOne(
            "capstone", 
            "user", 
            userRecord
        );

        if (!userDB || !userDB.acknowledged) {
            log.warn(`Unable to insert to DB, user: ${ { email, firstName, lastName } }`);
            return false;
        }

        this.users.set(email, userRecord);
        
        return true;
    }
}

module.exports = new UserService();