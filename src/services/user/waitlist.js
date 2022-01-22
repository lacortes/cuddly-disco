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
    
            const emailDB = await db.insertOne(
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
                log.warn(`Unable to insert to DB, email: ${ email }`);
                return false;
            }
            
            waitlist.set(email, emailDB);
    
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