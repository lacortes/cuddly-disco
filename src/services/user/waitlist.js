function makeWaitlist({ db, log }) {
    return function waitlist() {
        const waitlist = new Map();

        const get = async email => {
            if (waitlist.has(email)) {
                return waitlist.get(email);
            }

            const userDB = await db.findOne("capstone", "user_waitlist", { email });
            if (userDB) {
                waitlist.set(email, userDB);
            }
            return userDB;
        }

        const isInWaitlist = async email => {
            return await get(email) !== null;
        }

        const add = async emailValidation => {
            const { email, isValid, emailStatus } = emailValidation;
            if (!email || isValid === undefined || !emailStatus) {
                return false;
            }

            const emailRecord = {
                email, 
                isValid,
                emailStatus,
                signUpDate: Date.now(),
                lastNotifiedAt: null
            };

            const emailDB = await db.insertOne(
                "capstone", 
                "user_waitlist", 
                emailRecord
            );
            
            if (!emailDB || !emailDB.acknowledged) {
                log.warn(`Unable to insert to user_waitlist DB, email: ${ email }`);
                return false;
            }
            
            waitlist.set(email, emailRecord);    
            return true;
        }
        
        return (Object.freeze({
            get, 
            add,
            isInWaitlist
        }));
    };
}

module.exports = makeWaitlist;