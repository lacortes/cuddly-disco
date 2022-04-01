const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../../config/app');
const MongoDB = require('../../services/users');

const isAuthorized = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    const strTokens = !authHeader ? [] : authHeader.split(' ', 2); // 'Bearer asd324jxdfh'
    if (!authHeader || strTokens.length !== 2 || strTokens[0] !== 'Bearer') {
        res.status(400).json({
            ok: false
        });
        return;
    }

    let val;
    try {
        val = jwt.verify(strTokens[1], JWT_SECRET_KEY, { maxAge: "15m" });
    } catch (err) {
        res.status(401).json({
            ok: false
        });
        return;
    }

    const { email } = val;
    if (!email) {
        res.status(401).json({
            ok: false
        });
        return;
    }

    console.log('Before async call')
    const user = await MongoDB.get(email);
    console.log('After async call:' + user)
    if (!user) {
        res.status(401).json({
            ok: false
        });
        return;
    }

    next();
};

module.exports = {
    isAuthorized: isAuthorized
};