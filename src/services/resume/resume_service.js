function makeResumeService({ s3Service, db, log }) {

    return function resumeService() {

        const upload = async file  => {

            try {
                const oldResumeDB = await db.deleteOne("capstone", "resume", { s3Key: { $exists: true } });
                if (!oldResumeDB || !oldResumeDB.acknowledged) {
                    log.warn(`Unable to remove old resume key from DB`);
                    return Promise.reject();
                }
            
                const resumeID = await s3Service.upload({ file, contentType: 'pdf' });
                const resumeDB = await db.insertOne("capstone", "resume", { s3Key: resumeID, createdAt: new Date() });
                if (!resumeDB || !resumeDB.acknowledged) {
                    log.warn(`Resume did not upload to DB: ${ resumeID }`);
                    return Promise.reject();
                }
                
                return Promise.resolve();
            } catch (err) {
                log.warn(`Unable to upload resume: ${ err }`);
                return Promise.reject(null);
            }

        };
        
        const download = async () => {
            try {
                const key = await db.findOne("capstone", "resume", { s3Key: { $exists: true } });
                if (key == null) {
                    log.warn("Resume Key not found in DB");
                    return Promise.resolve(null);
                }

                const { s3Key } = key;
                const file = await s3Service.getFile({
                    filename: s3Key
                });

                return Promise.resolve(file);
            } catch (err) {
                log.warn(`Unable to get s3 file: ${ err }`)
                return Promise.reject(null);
            }
        };

        return (Object.freeze({
            upload,
            download
        }));
    }
}

module.exports = { makeResumeService };