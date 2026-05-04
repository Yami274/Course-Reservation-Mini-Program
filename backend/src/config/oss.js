const OSS = require('ali-oss');

const ossClient = process.env.OSS_ACCESS_KEY_ID ? new OSS({
  region: process.env.OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
  endpoint: process.env.OSS_ENDPOINT
}) : null;

module.exports = ossClient;
