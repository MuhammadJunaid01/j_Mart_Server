// const multer = require("multer");
// const path = require("path");
// const fileStorageEngine = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../../public/products"));
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "--" + file.originalname);
//   },
// });

// const upload = multer({ storage: fileStorageEngine }).single("image");

// module.exports = upload;
