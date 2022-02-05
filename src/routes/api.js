const express = require('express');
const helmet = require('helmet');
const validator = require('validator');
const userService = require('../services/users');
const userWaitList = require('../services/user/index');
const passGen = require('../utils/password');
const { emailList, emailValidator } = require('../services/email/index');

const router = express.Router();

router.use(helmet());

const validateEmail = (req, res, next) => {
    const { email } = req.body;
    if (email && !validator.isEmail(email)) {
        res.status(400).json({
            ok: false, 
            message: "Email Invalid!"
        });
        return;
    }
    next();
};

router.post('/request-access', validateEmail, async (req, res) => {
    const { email, first_name, last_name } = req.body;

    if (!validator.isAlpha(first_name) || !validator.isAlpha(last_name)) {
        res.status(400).json({
            ok: false,
            message: "Invalid first / last name"
        });
        return;
    }

    let isValidEmail = false;
    if (await emailList.has(email)) {
        const emailDB = await emailList.get(email);
        isValidEmail = emailDB.isValid ?? false;
    } else {
        const emailValidation = await emailValidator.validate(email);
        if (emailValidation == null) {
            res.status(500).json({
                ok: false,
                message: "Internal error"
            });
            return; 
        }

        await emailList.add(email, emailValidation);
        isValidEmail = emailValidation.isValid;
    }

    if (isValidEmail === false) {
        res.status(400).json({
            ok: false, 
            message: "Email Invalid!"
        });
        return;
    }
    
    const requestExists = await userService.userExists(email);
    if (requestExists) {
        res.status(200).json({
            ok: true,
            message: "Request for access already submitted"
        });
        return;
    }

    const pass = passGen.generate();
    const created = await userService.createUser(email, first_name, last_name, pass);
    if (!created) {
        res.status(400).json({
            ok: false,
            message: "Unable to create user"
        });
        return;
    }

    res.status(201).json({
        ok: true,
        message: 'Request has been submitted',
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

    const emailValidation = await emailValidator.validate(email);
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