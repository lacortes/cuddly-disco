function emailZeroBounce({ log, axios, emailKey }) {
    return async email => {
        try {
            const resp = await axios.get(`https://api.zerobounce.net/v2/validate?api_key=${ emailKey }&email=${ email }&ip_address=`);
            
            const data = resp?.data;
            if (!data || data.error) {
                log.error(`Unable to validate email: ${ JSON.stringify(data) }`);
                return null;
            }
            const obj = { email, emailStatus: data.status, isValid: data.status === 'valid', processedAt: data.processed_at };
            log.debug(obj);
            return obj;
        } catch (err) {
            log.error(`Failed to validate email: ${ email }. ${ err }`);
        }
        return null;
    };
}

module.exports = emailZeroBounce;