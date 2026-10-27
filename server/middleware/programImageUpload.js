import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (/^image\/(webp|png|jpe?g|avif)$/.test(file.mimetype)) return cb(null, true);
    cb(new Error("Only WEBP, PNG, JPG or AVIF images are allowed"));
  },
}).single("image");

// Wrapper so multer errors come back as clean JSON instead of a stack trace.
export const programImageUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return next();

    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : err.message;

    return res.status(400).json({ message });
  });
};