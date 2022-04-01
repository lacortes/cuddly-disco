const { makeResumeService } = require('./resume_service');
const { s3Service } = require('../resource-mgmt/index');
const log = require('../../utils/logger');
const db = require('../../db');

const resumeService = makeResumeService({ s3Service, db, log });

module.exports = {
    resumeService: resumeService()
};