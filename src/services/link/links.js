function createMagicLink({ db, log, bcrypt, isProd }) {
    return function() {
        const tokens = new Map();

        const get = async token => {
            if (tokens.has(token)) {
                return tokens.get(token);
            }

            const linkDB = await db.findOne("capstone", "link", { token });
            if (linkDB) {
                tokens.set(token, linkDB);
            }
            return linkDB;
        }

        const update = async linkRecord => {
            const link = linkRecord.link;
            const linkCache = tokens.get(link);
            if (linkCache) {
                tokens.delete(link);
            }
    
            const result = await db.removeOne("capstone", "link", {link: linkRecord.link});
            if (!result || !result.acknowledged) {
                log.warn(`Unable to remove from DB, link: ${ linkRecord.link }`);
                return false;
            }
            return true;
        }

        const add = async (email) => {
            let link;
            if (!email || tokens.has(email)) {
                return link;
            }
    
            const salt = await bcrypt.genSalt();
            const hashed = await bcrypt.hash(email, salt);
            const encodedToken =  encodeURI(hashed);
    
            const linkRecord = {
                email,
                link: hashed,
            }
            const linkDB = await db.insertOne(
                "capstone",
                "link",
                linkRecord
            );
            if (!linkDB || !linkDB.acknowledged) {
                log.warn(`Unable to insert to DB, link: ${ { email, link } }`);
                return link;
            }
    
            tokens.set(encodedToken, linkRecord);
            link = 'link=' + encodedToken;

            const loginLink = true ? 'https://www.karly-capstone.com' : 'https://karly-capstone.dev:3000';
            const fullLink = loginLink + '/magic?' + link;

            return fullLink;
        }

        return Object.freeze({
            get,
            update, 
            add
        });
    };
}

module.exports = createMagicLink;