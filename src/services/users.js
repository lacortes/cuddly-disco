const bcrypt = require('bcrypt');
const MongoDB = require('../db');

class UserService {
    constructor() {
        this.users = new Map();
    }

    async getUserDB(email) {
        return await MongoDB.findOne("capstone", "user", { email });
    }

    async userExists(email) {
        return await this.getUserDB(email) !== null;
    }

    async createUser(email, pass) { 
        if (!pass || !email) {
            return false;
        }

        const exists = await this.userExists(email);
        if (exists) {
            return false;
        }
        
        const salt = await bcrypt.genSalt();
        const hashed = await bcrypt.hash(pass, salt);
        
        await MongoDB.insertOne(
            "capstone", 
            "user", {
                email,
                hashedPass: hashed,
                passCreated: Date.now()
            }
        );
        
        return true;
    }
}

module.exports = new UserService();