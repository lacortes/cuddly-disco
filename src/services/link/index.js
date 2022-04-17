
const MongoDB = require('../../db');
const log = require('../../utils/logger');
const bcrypt = require('bcrypt');
const createMagicLink = require('./links');
const { NODE_ENV } = require('../../config/app');

const isProd = NODE_ENV === 'production';
const magicLink = createMagicLink({ db: MongoDB, log, bcrypt, isProd });

module.exports = { 
    magicLink: magicLink(),
};