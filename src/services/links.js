const MongoDB = require('../db');
const log = require('../utils/logger');
const bcrypt = require('bcrypt');

class LinkService {
    constructor() {
        this.tokens = new Map();
    }

    async createLink(email) {
        let link;
        if (!email || this.tokens.has(email)) {
            return link;
        }

        const salt = await bcrypt.genSalt();
        const hashed = await bcrypt.hash(email, salt);
        const encodedToken =  encodeURI(hashed);

        const linkRecord = {
            email: email,
            link: hashed,
        }
        const linkDB = await MongoDB.insertOne(
            "capstone",
            "link",
            linkRecord
        );
        if (!linkDB || !linkDB.acknowledged) {
            log.warn(`Unable to insert to DB, link: ${ { email, link } }`);
            return link;
        }

        link = 'link=' + encodedToken;
        this.tokens.set(encodedToken, linkRecord);
        return link;
    }

    async getLink(token) {
        if (this.tokens.has(token)) {
            return this.tokens.get(token);
        }

        const linkDB = await MongoDB.findOne("capstone", "link", { token });
        if (linkDB) {
            this.tokens.set(token, linkRecord);
        }
        return linkDB;
    }

    async updateLinkAsUsed(linkRecord) {
        const link = linkRecord.link;
        const linkCache = this.tokens.get(link);
        if (linkCache) {
            this.tokens.delete(link);
        }

        const result = await MongoDB.removeOne("capstone", "link", {link: linkRecord.link});
        if (!result || !result.acknowledged) {
            log.warn(`Unable to remove from DB, link: ${ linkRecord.link }`);
            return false;
        }
        return true;
    }
}

module.exports = new LinkService();