import multer from "multer";

const storage = multer.memoryStorage();

const taskUpload = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024, // Maximum 100 MB
    files: 10,
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      // Images
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",

      // Videos
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",

      // Audio
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/webm",
      "audio/ogg",
      "audio/mp4",
      "audio/aac",

      // Documents
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Unsupported file type. Please upload a supported image, video, audio, or document."
        )
      );
    }
  },
});

export default taskUpload;