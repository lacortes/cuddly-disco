const axios = require('axios').default;
const log = require('./logger');

axios.interceptors.request.use(config => {
    const { method, url } = config;

    log.info(
        `${ method.toUpperCase() } ${ url }`
    );
    return config;
}, err => {
    log.info(err);
    return Promise.reject(err);
});

axios.interceptors.response.use(response => {
    const { status, data } = response;
    log.info(
        `${status} ${JSON.stringify(data)}`
    );
    return response;
}, err => {
    log.info(err);
    return Promise.reject(err);
});

module.exports = axios;