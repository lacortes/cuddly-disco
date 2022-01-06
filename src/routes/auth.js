const express = require('express');
const helmet = require('helmet');
const validator = require('validator');
const MongoDB = require('../services/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const appConfig = require('../config/app');

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

router.post('/login', validateLogin, async (req, res) => {
    const { email, pass } = req.body;
    const user = await MongoDB.getUserDB(email);
    if (!user) {
        res.status(401).json({
            ok: false,
            error: 'Invalid credentials!'
        });
        return;
    }

    const authenticated = await bcrypt.compare(pass, user.hashedPass);
    if (!authenticated) {
        res.status(401).json({
            ok: false,
            error: 'Invalid credentials!'
        });
        return;
    }

    const token = jwt.sign({ email }, appConfig.jwt_secret_key, { expiresIn: "12h" });

    res.json({
        ok: true,
        token
    });
});

router.get('/is-authorized', (req, res) => {
    res.json({
        ok: true
    });
});

module.exports = router;