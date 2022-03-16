function makeS3Service({ s3, cmd, bucket, uuid, log }) {
    
    return function s3Service() {

        const upload = async ({ file, path='', extension='' }) => {
            if (!file) {
                log.info('Cannot upload with no file');
                return false;
            }
            return sendCommand(new cmd.PutObjectCommand({
                Bucket: bucket,
                Body: file,
                Key: `${ path }${ uuid() }${ extension ? '.'+extension : '' }`
            }));
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