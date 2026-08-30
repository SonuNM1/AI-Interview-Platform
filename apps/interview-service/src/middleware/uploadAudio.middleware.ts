import multer from "multer"

// store uploaded audio directly in memory - we dont need to permanently store the candidate's audio file at this stage. The audio will be sent to the transcription provider and then discarded

const storage = multer.memoryStorage() ;

// audio formats accepted by the Interview Service 

const allowedMimeTypes = [
  "audio/webm",
  "audio/wav",
  "audio/wave",
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/ogg",
];

// validating the uploaded file before it reaches the controller 

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
    if(!allowedMimeTypes.includes(file.mimetype)) {
        return callback(new Error("Invalid audio format. Supported formats: webm, wav, mp3, mp4, m4a, ogg."))
    }
    callback(null, true) ; 
}

// multer configuration for candidate interview answers 

export const uploadAudio = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});