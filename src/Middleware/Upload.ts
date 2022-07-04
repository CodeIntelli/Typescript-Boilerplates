import multer from "multer";

// * defined filter
const fileFilter = (req: Request, file: any, cb: any) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/webp' ||
        file.mimetype === 'image/svg+xml' ||
        file.mimetype === 'image/gif' ||
        file.mimetype === 'image/avif' ||
        file.mimetype === 'image/apng' ||
        file.mimetype === 'application/octet-stream'
    ) {
        cb(null, true);
    } else {
        cb(new Error('File format should be PNG,JPG,JPEG,WEBP,SVG,XML,GIF,AVIF & APNG'), false); // if validation failed then generate error
    }
};

// *file upload using validation
const upload = multer({
    dest: "src/uploads/",
    // @ts-ignore
    fileFilter: fileFilter
});

export default upload