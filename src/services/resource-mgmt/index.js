const { v4 } = require('uuid');
const makeS3Service = require('./s3_service');
const { AWS_S3_BUCKET_ARN } = require('../../config/app');
const log = require('../../utils/logger');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: 'us-west-1',
    credentials: defaultProvider(),
    tls: true
});

const cmd = {
    PutObjectCommand, 
    GetObjectCommand,
    DeleteObjectCommand
}

const s3Service = makeS3Service({ s3, cmd, bucket: AWS_S3_BUCKET_ARN, uuid: v4, log });

module.exports = {
    s3Service: s3Service()
};