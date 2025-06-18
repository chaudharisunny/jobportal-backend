const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dir = './uploads/cv';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Use original filename directly
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;
