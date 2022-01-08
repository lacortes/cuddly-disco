const dotenv = require('dotenv').config();

module.exports = {
    port: process.env.PORT,
    db_uri: process.env.DB_URI,
    jwt_secret_key: process.env.JWT_SECRET_KEY,
    email_key: process.env.EMAIL_KEY,
    node_env: process.env.NODE_ENV
};