import cloudinary from "cloudinary";
import ErrorHandler from './ErrorHandler';
const Cloudinary = {
    async UploadFile(file: any, folder: any) {
        const myCloud = await cloudinary.v2.uploader.upload(file, {
            folder: folder,
            width: 150,
            crop: "scale",
        });
        return {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    },
    async fileSizeConversion(size: any) {
        if (size == 0) return "0 Bytes";
        var k = 1000,
            dm = 2,
            sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
            i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    },

    async RemoveFile(imageId: any) {
        if (imageId == "") {
            // @ts-ignore
            return new ErrorHandler.notFound("ImageID Can't Be Null");
        }
        return await cloudinary.v2.uploader.destroy(imageId);
    },
};

export default Cloudinary;
