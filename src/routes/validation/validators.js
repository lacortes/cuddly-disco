const Joi = require('joi');

const email = Joi.string().email().required();
const name = Joi.string().trim().pattern(/^[a-zA-Z]+$/).min(1).required();
const password = Joi.string().trim().length(12).required();
const token = Joi.string().required();

const requestAccess = Joi.object({
    email,
    first_name: name,
    last_name: name
});

const emailSignUp = Joi.object({
    email
});

const login = Joi.object({
    email,
    pass: password
});

const magicLink = Joi.object({
    token,
});

const makeValidate = (joiSchema, opts = {}) => {
    return (req, resp, next) => {
        const { error } = joiSchema.validate(req.body, opts);

        if (error != null) {
            const { details } = error;
            resp.status(400).json({
                ok: false,
                message: details[0].message.replace(/\"/g, '')
            });
            return;
        }
        next();
    };
}

module.exports = {
    validateRequestAccess: makeValidate(requestAccess),
    validateSignUp: makeValidate(emailSignUp),
    validateLogin: makeValidate(login),
    validateToken: makeValidate(magicLink),
};