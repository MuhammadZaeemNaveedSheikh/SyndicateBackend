require('dotenv').config()
// const AWS = require('aws-sdk');
const multer = require('multer');


// AWS.config.update({
//   accessKeyId: process.env.AWS_S3_ACCESS_KEY,
//   secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
//   region: process.env.AWS_S3_REGION,
// });

// module.exports.s3 = new AWS.S3();



module.exports.upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});