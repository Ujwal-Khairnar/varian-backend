const multer    = require('multer');
const multerS3  = require('multer-s3');
const s3Client  = require('./s3');
const { v4: uuidv4 } = require('uuid');

const upload = multer({
  storage: multerS3({
    s3:      s3Client,
    bucket:  process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (req, file, cb) => {
      const folder = req.uploadFolder || 'general';
      const ext    = file.originalname.split('.').pop();
      cb(null, `${folder}/${uuidv4()}.${ext}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  },
});

module.exports = upload;