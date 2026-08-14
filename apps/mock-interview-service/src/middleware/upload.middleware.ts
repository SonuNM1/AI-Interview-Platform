import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "audio/webm",
  "audio/wav",
  "audio/wave",
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/ogg",
];

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  callback,
) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new Error(
        "Invalid audio format. Supported formats: webm, wav, mp3, mp4, m4a, ogg.",
      ),
    );
  }

  callback(null, true);
};

export const uploadAudio = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter,
});