function makeEmailList({ db, log }) {
    return function() {
        const emailList = new Map();

        const has = async email => {
            return await get(email) !== null;
        }

        const get = async email => {
            if (emailList.has(email)) {
                return emailList.get(email);
            }

            const emailDB = await db.findOne("capstone", "email_list", { email });
            if (emailDB) {
                emailList.set(email, emailDB);
            }

            return emailDB;
        }

        const add = async (email, emailRecord) => {

            if (!email || !emailRecord) {
                return;
            }

            const emailDB = await db.insertOne(
                "capstone",
                "email_list",
                emailRecord
            );

            if (!emailDB || !emailDB.acknowledged) {
                log.warn(`Unable to insert to email_list DB, email: ${ emailRecord }`);
                return false;
            }

            emailList.set(email, emailRecord);
        }

        return Object.freeze({
            get,
            has, 
            add
        });
    };
}

module.exports = makeEmailList;