import multer from "multer";

// Store uploaded files in memory before forwarding to File Service.
const storage = multer.memoryStorage();

const upload = multer({
    storage,

    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },

    fileFilter(req, file, cb) {

        const allowedMimeTypes = [

            // Images
            "image/jpeg",
            "image/png",
            "image/webp",

            // Documents
            "application/pdf",

            "application/msword",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error("Unsupported file type."));
        }

        cb(null, true);

    }

});

export default upload;