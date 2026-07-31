import multer from "multer";

// configuring multer to store uploaded files in memory

const storage = multer.memoryStorage() ;

const upload = multer({
    storage, 
    limits: {
        fileSize: 10 * 1024 * 1024, // Maximum allowed file size (10 MB)
    }, 
    fileFilter(req, file, cb) {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",

            "application/pdf",

            "application/msword",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ] ; 

        if(!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error("Unsupported file type."));
        }
        
        cb(null, true) ; 
    }
})

export default upload ; 