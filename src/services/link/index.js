
const MongoDB = require('../../db');
const log = require('../../utils/logger');
const bcrypt = require('bcrypt');
const createMagicLink = require('./links');

const magicLink = createMagicLink({ db: MongoDB, log, bcrypt });

module.exports = { 
    magicLink: magicLink(),
};