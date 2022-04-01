const express = require('express');
const helmet = require('helmet');
const validator = require('validator');
const MongoDB = require('../services/users');
const { magicLink } = require('../services/link/index');
const log = require('../utils/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateToken } = require('./validation/validators');
const { JWT_SECRET_KEY, JWT_REF_SECRET_KEY, NODE_ENV } = require('../config/app');
const { isAuthorized } = require('./validation/authorization');

const router = express.Router();
router.use(helmet());

const validateLogin = (req, res, next) => {
    const { email, pass } = req.body;

    if (!email || !pass || !validator.isEmail(email)) {
        res.status(400).json({
            ok: false
        });
        return;
    }

    next();
};

router.post('/magic', validateToken, async (req, res) => {
    const { token } = req.body;
    const linkRecord = await magicLink.get(token);
    if (!linkRecord) {
        res.status(401).json({
            ok: false,
            message: 'Invalid magic link!'
        });
        return;
    }
    await magicLink.update(linkRecord);

    setTokensAndRespond(res, linkRecord.email);

});

router.post('/login', validateLogin, async (req, res) => {
    const { email, pass } = req.body;
    const user = await MongoDB.get(email);
    if (!user) {
        res.status(401).json({
            ok: false,
            message: 'Invalid email or password'
        });
        return;
    }

    const passCreated = new Date(user.passCreated);
    const passExpires = new Date(passCreated);
    passExpires.setDate(passExpires.getDate() + 14);
    if (passCreated >= passExpires) {
        res.status(401).json({
            ok: false,
            message: 'Password expired, must request new one!'
        });
        return;
    }

    const authenticated = await bcrypt.compare(pass, user.hashedPass);
    if (!authenticated) {
        res.status(401).json({
            ok: false,
            message: 'Invalid email or password'
        });
        return;
    }

    setTokensAndRespond(res, email);
});

const setTokensAndRespond = (res, email) => {
    const access_token = jwt.sign({ email }, JWT_SECRET_KEY, { expiresIn: "15m" });
    const refresh_token = jwt.sign({ email }, JWT_REF_SECRET_KEY, { expiresIn: "14d" });
    res.cookie(
        'rt', 
        refresh_token, 
        cookieProps
    ).status(200).json({
        ok: true,
        access_token, 
        expiry: minutesFromNow(15).toUTCString(),
    });
}

router.get('/is-authorized', isAuthorized, async (req, res) => {

    res.status(200).json({
        ok: true
    });
});

router.get('/refresh-token', async (req, res) => {
    if (!req.cookies) {
        res.status(400).json({
            ok: false
        });
        return;
    }

    const refreshToken = req.cookies.rt;
    if (!refreshToken) {
        res.status(400).json({
            ok: false
        });
        return;
    }

    let val;
    try {
        val = jwt.verify(refreshToken, JWT_REF_SECRET_KEY, { maxAge: "14d" });
    } catch (err) {
        res.status(401).json({
            ok: false
        });
        return;
    }

    let { email } = val;
    if (!email) {
        res.status(401).json({
            ok: false
        });
        return;
    }

    const user = await MongoDB.get(email);
    if (!user) {
        res.status(401).json({
            ok: false
        });
        return;
    }

    setTokensAndRespond(res, email);
});

const daysFromNow = days => {
    const today = new Date();
    today.setDate( today.getDate() + days );
    return today;
};

const minutesFromNow = min => {
    const today = new Date();
    today.setMinutes( today.getMinutes() + min );
    return today;
};

const isDev = NODE_ENV !== 'production';
const cookieProps = {
    secure: true,
    httpOnly: true,
    sameSite: 'Lax',
    domain: 'karly-capstone.dev',
    expires: daysFromNow( isDev ? 2 : 7 )
};

module.exports = router;