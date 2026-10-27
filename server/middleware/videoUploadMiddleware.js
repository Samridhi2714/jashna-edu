import multer from "multer";

const storage = multer.memoryStorage();

const videoUpload = multer({
  storage,

  limits: {
    // 100 MB maximum
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only MP4, WebM, MOV, and AVI video files are allowed",
        ),
      );
    }
  },
});

export default videoUpload;