const winston = require('winston');

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  };

const level = () => {
    const env = process.env.NODE_ENV || 'development'
    const isDevelopment = env === 'development'
    return isDevelopment ? 'debug' : 'warn'
}

const getTransports = () => {
    let transports = [];

    if (level() === 'debug') {
        transports.push(new winston.transports.Console());
    } else {
        transports.push(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
        transports.push(new winston.transports.File({ filename: 'logs/app.log' }));
    }
    return transports;
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
}

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
)

const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports: getTransports()
});

module.exports = logger;