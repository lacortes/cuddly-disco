const MongoDB = require('../db');
const log = require('../utils/logger');
const bcrypt = require('bcrypt');

class LinkService {
    constructor() {
        this.links = new Map();
    }

    async createLink(email) {
        var link;
        if (!email || this.links.has(email)) {
            return link;
        }

        const salt = await bcrypt.genSalt();
        const hashed = await bcrypt.hash(email, salt);
        var params = new URLSearchParams();
        params.append('link', hashed);

        const linkRecord = {
            email: email,
            param: params.toString(),
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

        link = params.toString();
        this.links.set(link, linkRecord);
        return link;
    }

    async getLink(link) {
        if (this.links.has(link)) {
            return this.links.get(link);
        }

        const linkDB = await MongoDB.findOne("capstone", "link", { link });
        if (linkDB) {
            this.links.set(link, linkRecord);
        }
        return linkDB;
    }

    async updateLinkAsUsed(linkRecord) {
        const linkCache = this.links.get(link);
        if (linkCache) {
            this.links.delete(link);
        }

        const result = await MongoDB.removeOne({linkRecord});
        if (result !== 1) {
            log.warn(`Unable to remove from DB, link: ${ linkRecord }`);
            return false;
        }
        return true;
    }
}

module.exports = new LinkService();