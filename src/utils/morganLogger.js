const morgan = require('morgan');
const logger = require('./logger');

const stream = {
    write: message => logger.http(message)
};

const skip = () => {
    const env = process.env.NODE_ENV || "development";
    return env !== "development";
};

const morganLogger = morgan(
    'tiny',
    { stream, skip}
);

module.exports = morganLogger;