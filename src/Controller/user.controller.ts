import { NextFunction, Request, Response } from "express";
import { userModel } from "../Models";
import { ErrorHandler, SendEmail, SendToken } from "../Utils";
import { getSignedUrl, uploadFile } from "../Utils/AWSUpload"

let NAMESPACE = "";
const userController = {
  async testing(req: Request, res: Response, next: NextFunction) {
    NAMESPACE = "Registration";
    res.status(200).json({ "message": "Your Controller Connected" })
  },
  async getUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req)
      //@ts-ignore
      const user = await userModel.findById(req.user.id);
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  async getAllUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userModel.find();
      res.status(200).json({ success: true, users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  // if authenticated
  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      const user = await userModel.findById(req.user.id).select("+password");
      // @ts-ignore
      const isPasswordMatched = await user.comparePassword(
        req.body.oldPassword
      );
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password Is Incorrect", 400));
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password Doesn't match", 400));
      }
      //@ts-ignore

      user.password = req.body.newPassword;
      //@ts-ignore
      await user.save();
      SendToken(user, 200, res);
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      return new ErrorHandler(error, 500);
    }
  },
  // get single user - admin
  async getSingleUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userModel.findById(req.params.id);

      if (!user) {
        return next(
          new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 404)
        );
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return new ErrorHandler(error, 500);
    }
  },

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
      };

      await userModel.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });

      res.status(200).json({
        success: true,
      });
    } catch (error: any) {
      return new ErrorHandler(error, 500);
    }
  },

  async updateUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const newUserData = {
        name: req.body.name,
        email: req.body.email,
      };
      if (req.body.avatar !== "") {
        //@ts-ignore
        const user = await userModel.findById(req.user.id);

        //@ts-ignore
        const imageId = user.avatar.public_id;

        //@ts-ignore
        await cloudinary.v2.uploader.destroy(imageId);

        //@ts-ignore
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });
        //@ts-ignore
        newUserData.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      //@ts-ignore
      const user = await userModel.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });

      res.status(200).json({
        success: true,
      });

      next();
    } catch (error: any) {
      return new ErrorHandler(error, 500);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userModel.findById(req.params.id);

      if (!user) {
        return next(
          new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
        );
      }

      await user.remove();

      res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
      });
    } catch (error: any) {
      return new ErrorHandler(error, 500);
    }
  },

  async setProfile(req: Request, res: Response) {

    try {
      const file = req.file;
      const result = await uploadFile(file);
      const profile = {
        profile: result.Key
      }

      // @ts-ignore
      await userModel.findByIdAndUpdate(req.user._id, profile, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });
      return res.json({
        filePath: `${result.Key}`,
        Location: `${result.Location}`
      });
    } catch (err) {
      console.log(err);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const key = req.params.id;
      if (!key) {
        new ErrorHandler("please provide valid key", 402)
      }
      const result = await getSignedUrl(key);
      return res.json({
        success: true,
        data: result
      })
    } catch (err) {
      new ErrorHandler(err, 500)
    }
  }
};

export default userController;