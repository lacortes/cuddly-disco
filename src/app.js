const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { PORT, NODE_ENV } = require('./config/app');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const MongoDB = require('./db');
const log = require('./utils/logger');
const rateLimit = require('express-rate-limit');

const path = require('path');
global.__basedir = path.join(__dirname, '..');

const { morganLogger, morganConsoleLogger } = require('./utils/morganLogger')

const app = express();
const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 500, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const initExpress = () => {
    app.use(morganLogger);
    app.use(morganConsoleLogger);
    app.use(helmet());
    app.use(cors({
        origin: setUpCors(),
        credentials: true
    }));
    app.use(express.json());
    app.use(cookieParser());
    app.use(limiter);

    // Routes
    app.use('/api', apiRouter);
    app.use('/auth', authRouter);

    log.info('env: ' + NODE_ENV)
    setupAppListen();
};

const initApp = async () => {
    log.info("Initializing Application ...");
    try {
        await MongoDB.init();
        initExpress();
    } catch (e) {
        log.error(`... error on startup!!!, error: ${ e }`);
        process.exit(1);
    }
}

const setupAppListen = () => {
    if (NODE_ENV === 'production') {
        app.listen(PORT, () => {
            log.info(`Server is listening on port : ${PORT}`);
        });
    } else {
        const keyPath = `${ __basedir }/ssl/api.karly-capstone.dev-key.pem`;
        const certPath = `${ __basedir }/ssl/api.karly-capstone.dev.pem`;

        log.info(`Reading SSL cert key : ${ keyPath }`);
        log.info(`Reading SSL cert     : ${ certPath }`);

        const key = fs.readFileSync(keyPath, 'utf-8');
        const cert = fs.readFileSync(certPath, 'utf-8');
        const options = {
            key: key,
            cert: cert
        };

        https.createServer(options, app)
             .listen(PORT, 'api.karly-capstone.dev', () => log.info(`HTTPS Server is listening on port : ${PORT}`))
        ;
    }
}

const setUpCors = () => {
    return NODE_ENV === 'production' ? 'https://www.karly-capstone.com' : 'https://karly-capstone.dev:3000';
}

initApp();