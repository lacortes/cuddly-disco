const dotenv = require('dotenv').config();

module.exports = {
    PORT: process.env.PORT,
    DB_URI: process.env.DB_URI,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    JWT_REF_SECRET_KEY: process.env.JWT_REF_SECRET_KEY,
    EMAIL_KEY: process.env.EMAIL_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development',
    AWS_SES_FROM: process.env.AWS_SES_FROM,
};