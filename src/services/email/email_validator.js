function makeEmailValidator({ validateEmail }) {
    return function emailValidator() {
        
        const validate = async email => validateEmail(email);

        return (Object.freeze({
            validate
        }));
    };
}

module.exports = makeEmailValidator;