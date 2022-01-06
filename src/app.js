const express = require('express');
const appConfig = require('./config/app');
const helmet = require('helmet');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const cors = require('cors');
const MongoDB = require('./db');
const log = require('./utils/logger');
const morgan = require('./utils/morganLogger');

const PORT = appConfig.port;

const app = express();

const initExpress = () => {
    app.use(morgan);
    app.use(helmet());
    app.use(cors({
        origin: '*'
    }));
    app.use(express.json());

    // Routes
    app.use('/api', apiRouter);
    app.use('/auth', authRouter);


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

initApp();