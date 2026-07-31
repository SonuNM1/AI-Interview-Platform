import multer from "multer";

// stores uploaded files in memory before forwarding them to the File Service

const storage = multer.memoryStorage() ; 

const upload = multer({
    storage, 
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },

    // allows imgae and pdf uploads both

    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
        ];

        console.log("File type: ", file.mimetype);

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true) ; 
        } else {
            cb(new Error(`Unsupported file type: ${file.mimetype}`))
        }
    }
})

export default upload ; 