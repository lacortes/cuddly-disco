const makeWaitlist = require('./waitlist');
const MongoDB = require('../../db');
const log = require('../../utils/logger');

const UserWaitlist = makeWaitlist({ db: MongoDB, log });

module.exports = UserWaitlist();