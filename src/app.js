const express = require('express');
const appConfig = require('./config/app');
const helmet = require('helmet');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const cors = require('cors');
const MongoDB = require('./db');
const log = require('./utils/logger');

const path = require('path');
global.__basedir = path.join(__dirname, '..');

const { morganLogger, morganConsoleLogger } = require('./utils/morganLogger')

const PORT = appConfig.port;
const NODE_ENV = appConfig.node_env;

const app = express();

const initExpress = () => {
    app.use(morganLogger);
    app.use(morganConsoleLogger);
    app.use(helmet());
    app.use(cors({
        origin: setUpCors()
    }));
    app.use(express.json());

    // Routes
    app.use('/api', apiRouter);
    app.use('/auth', authRouter);

    log.info('env: ' + NODE_ENV)
    app.listen(PORT, () => {
        log.info(`Server is listening on port : ${PORT}`);
    });
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

const setUpCors = () => {
    return NODE_ENV === 'production' ? 'https://www.karly-capstone.com' : '*';
}

initApp();