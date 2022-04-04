function makeResumeService({ s3Service, db, log }) {

    return function resumeService() {

        const upload = async ({ key, file }) => {

            try {
                const oldRecord = await db.findOneAndDelete("capstone", "resource", { [key]: { $exists: true } });
                console.log(oldRecord);
                if (!oldRecord || oldRecord.ok == 0) {
                    log.warn(`Unable to remove old resume key from DB`);
                    return Promise.reject();
                }

                const oldValue = oldRecord?.value;
                if (oldValue) {
                    try {
                        await s3Service.deleteObj({ key: oldValue[key]});
                    } catch (err) {
                        log.warn(`Unable to remove old object from s3 : ${ oldValue[key] }`);
                        return Promise.reject(null);
                    }
                }
                
                const s3Key = await s3Service.upload({ file, contentType: 'pdf' });
                const resourceDB = await db.insertOne('capstone', 'resource', { [key]: s3Key, createdAt: new Date() });
                if (!resourceDB || !resourceDB.acknowledged) {
                    log.warn(`Resource did not upload to DB: ${ resourceDB }`);
                    return Promise.reject();
                }

                return Promise.resolve();
            } catch (err) {
                log.warn(`Unable to upload resource: ${ err }`);
                return Promise.reject(null);
            }

        };

        const download = async ({ key }) => {
            if (!key) {
                log.warn('No key provided for download');
                return Promise.reject(null);
            }
            
            try {
                const record = await db.findOne('capstone', 'resource', { [key]: { $exists: true } });
                if (record == null) {
                    log.warn(`${ key } not found in DB`);
                    return Promise.resolve(null);
                }

                const s3Key = record[key];
                const file = await s3Service.getFile({
                    filename: s3Key
                });

                return Promise.resolve(file);
            } catch (err) {
                log.warn(`Unable to get s3 file: ${ err }`);
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