const multer = require("multer");
const multerS3 = require("multer-s3");
const config = require("../config/config");
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: config.aws.awsRegion,
  credentials: {
    accessKeyId: config.aws.awsApiKey,
    secretAccessKey: config.aws.awsSecretKey,
  },
});
const uploader = (bucketName = "kafu-card-images-store") =>
  multer({
    storage: multerS3({
      s3: s3,
      bucket: bucketName,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(
          null,
          `${config.imagesBucketName}/` +
            Date.now().toString() +
            "-" +
            file.originalname
        );
      },
    }),
  });

module.exports.uploader = uploader;
