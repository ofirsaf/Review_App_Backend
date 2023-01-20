const multer = require("multer");
const storage = multer.diskStorage({});
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image")) {
    cb("Only images are allowed", false);
  } else {
    cb(null, true);
  }
};
exports.uploadImage = multer({ storage, fileFilter });
