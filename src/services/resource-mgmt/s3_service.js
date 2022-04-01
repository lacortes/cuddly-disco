function makeS3Service({ s3, cmd, bucket, uuid, log }) {
    
    return function s3Service() {

        const contentTypeMap = {
            pdf: 'application/pdf'
        };

        const upload = async ({ file, path='', extension='', contentType=''}) => {
            if (!file) {
                log.info('Cannot upload with no file');
                return false;
            }
            const key = `${ path }${ uuid() }${ extension ? '.'+extension : '' }`;
            let response = await sendCommand(new cmd.PutObjectCommand({
                Bucket: bucket,
                Body: file,
                ContentType: contentTypeMap[contentType],
                Key: key
            }));

            if (!response) {
                log.warn(`Cannot upload file : ${ file }`);
                return Promise.reject();
            }

            log.info(response);
            return Promise.resolve(key);
        }

        const getFile = async ({ filename, path='' }) => {
            if (!filename) {
                log.info('Cannot download with empty filename');
                return false;
            }

            return sendCommand(new cmd.GetObjectCommand({
                Bucket: bucket,
                Key: `${ path }${ filename }`
            }));
        };
    
        const sendCommand = async (s3Command) => {
            if (!s3Command) {
                log.info('No commnad found!');
                return Promise.reject();
            }
        
            let response;
            try {
                response = await s3.send(s3Command);
                log.info(response);
            } catch (err) {
                log.error(err);
                return Promise.reject();
            }
            return Promise.resolve(response);
        }
    
        return Object.freeze({
            upload,
            getFile
        });
    }
    
}

module.exports = makeS3Service;