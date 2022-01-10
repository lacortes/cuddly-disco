const morgan = require('morgan');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

const stream = {
    write: message => logger.http(message)
};

const skip = () => {
    const env = process.env.NODE_ENV || "development";
    return env !== "development";
};

const format = '[:date[web]] :remote-addr - ":method :url" :status :res[content-length] - :response-time ms';
const morganLogger = morgan(
    format, 
    { 
        stream: fs.createWriteStream(path.join(__basedir, 'logs/access.log'), 'w'), 
        skip: () => false
    }
);

const morganConsoleLogger = morgan(
    format,
    { stream, skip }
);

module.exports = { morganLogger, morganConsoleLogger };