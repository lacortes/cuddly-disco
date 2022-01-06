const express = require('express');
const helmet = require('helmet');
const validator = require('validator');
const userService = require('../services/users');
const userWaitList = require('../services/userWaitlist');
const passGen = require('../utils/password');
const emailService = require('../services/emailService');
const log = require('../utils/logger');

const router = express.Router();

router.use(helmet());

const validateEmail = (req, res, next) => {
    if (!validator.isEmail(req.body.email)) {
        res.status(400).json({
            ok: false
        });
        return;
    }
    next();
};

router.post('/request-access', validateEmail, async (req, res) => {
    const { email } = req.body;

    const pass = passGen.generate();
    const created = await userService.createUser(email, pass);
    if (!created) {
        res.status(400).json({
            ok: false,
            message: "Unable to create user"
        });
        return;
    }

    res.status(201).json({
        ok: true,
        pass: `${pass}`
    });
});

router.post('/email-sign-up', validateEmail, async (req, res) => {
    const { email } = req.body;

    const user = await userWaitList.get(email);
    if (user) {
        const ok = user.isValid;
        const status = ok ? 200 : 400
        const msg = ok ? 'User already signed up' : 'Invalid email'

        res.status(status).json({
            ok,
            msg
        });
        return; 
    }

    const emailValidation = await emailService.validateEmailAddress(email);
    if (emailValidation == null) {
        res.status(400).json({
            ok: false,
        });
        return; 
    }

    const added = await userWaitList.add(emailValidation);
    if (!added) {
        res.status(400).json({
            ok: false,
            message: "Unable to sign up"
        });
        return;
    }

    if (emailValidation.isValid === false) {
        res.status(400).json({
            ok: false,
            message: "Invalid Email"
        });
        return;
    }

    res.status(201).json({
        ok: true
    });
});

module.exports = router;