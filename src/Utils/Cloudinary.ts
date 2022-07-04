import cloudinary from "cloudinary";
import ErrorHandler from './ErrorHandler';
const Cloudinary = {
    async UploadFile(file:any, folder:any) {
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

    async RemoveFile(imageId:any) {
        if (imageId == "") {
            // @ts-ignore
            return new ErrorHandler.notFound("ImageID Can't Be Null");
        }
        return await cloudinary.v2.uploader.destroy(imageId);
    },
};

export default Cloudinary;
