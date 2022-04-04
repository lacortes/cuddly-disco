const express = require('express');
const helmet = require('helmet');
const multer = require('multer');
const validator = require('validator');
const { magicLink } = require('../services/link/index');
const userService = require('../services/users');
const userWaitList = require('../services/user/index');
const { resumeService } = require('../services/resume/index');
const passGen = require('../utils/password');
const { emailList, emailValidator, emailService } = require('../services/email/index');
const EmailEvent = require('../services/email/email_event');
const { validateRequestAccess, validateSignUp } = require('./validation/validators');

const router = express.Router();
const upload = multer({ 
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            cb(null, false);
            return;
        }
        cb(null, true);
    }, 
    limits: {
        fileSize: 3_000_000 // 3mb
    }
});

router.use(helmet());

router.post('/request-access', validateRequestAccess, async (req, res) => {
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

    const link = await magicLink.add(email);
    if (!link) {
        res.status(400).json({
            ok: false,
            message: "Unable to create link"
        });
        return;
    }

    emailService.sendEmail(
        email, 
        EmailEvent.RequestAccess, 
        { firstName: first_name, password: pass, link }
    );

    res.status(201).json({
        ok: true,
        message: 'Request has been submitted',
        pass: `${pass}`
    });
});

router.post('/email-sign-up', validateSignUp, async (req, res) => {
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

const allowedResourceKeys = {
    'resume': true,
    'culmination': true
};

router.post('/upload-resource', upload.single('file'), async (req, res) => {

    const { file } = req;
    const { key } = req.body;

    if (!file || !file.buffer) {
        res.status(500).json({
            ok: false
        });
        return;
    }

    const allowed = allowedResourceKeys[key] === true;
    if (!allowed) {
        res.status(400).json({
            ok: false,
            message: 'Invalid key'
        });
        return;
    }

    try {
        await resumeService.upload({ key, file: file.buffer });
    } catch (err) {
        res.status(500).json({
            ok: false,
            message: 'Unable to upload file!'
        });
        return;
    }


    res.status(200).json({
        ok: true
    });
});


router.get('/download-resource', async (req, res) => {
    const { fileKey } = req.query;
    
    if (!fileKey) {
        res.status(400).json({
            ok: false
        });
        return;
    }

    const isKeyAllowed = allowedResourceKeys[fileKey] === true;
    if (!isKeyAllowed) {
        res.status(400).json({
            ok: false,
            message: 'Invalid Key'
        });
        return;
    }

    let file = null;
    try {
        file = await resumeService.download({ key: fileKey });
        if (file == null) { 
            res.status(404).json({
                ok: false,
                message: 'No resource found'
            });
            return;
        }

    } catch (err) {
        res.status(500).json({
            ok: false,
            message: 'Servor error'
        });
        return;
    }

    if (file == null || !file.Body) {
        res.status(500).json({
            ok: false,
            message: 'File not found!'
        });
        return;
    }

    const fileName = encodeURIComponent(`karly-${ fileKey }.pdf`);
    res.status(200)
        .setHeader('Content-Disposition', `attachment; filename="${ fileName }"`)
        .setHeader('Content-type', 'application/pdf')
    ;
    file.Body.pipe(res);
});

module.exports = router;    