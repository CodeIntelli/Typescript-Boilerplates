import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { userModel } from "../Models";
import { ErrorHandler, SendEmail, SendToken, CheckMongoId, SuccessHandler, Cloudinary } from "../Utils";
import { getSignedUrl, uploadFile } from "../Utils/AWSUpload"
import cloudinary from "cloudinary";

let NAMESPACE = "";
const userController = {
  async testing(req: Request, res: Response, next: NextFunction) {
    NAMESPACE = "Registration";
    res.status(200).json({ "message": "Your Controller Connected" })
  },

  // [ + ] GET USER DETAILS
  async getUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      //@ts-ignore
      const user = await userModel.findById(req.user.id);
      // @ts-ignore
      if (user.status == "Deactivate") {
        next(
          new ErrorHandler(
            "It Seem's You have deleted Your Account Please Check Your Mail For More Details",
            422
          )
        );
        return SuccessHandler(200, "", "User Account Deactivate", res);
      }
      SuccessHandler(200, user, "User Details Display Successfully", res);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },


  // [ + ] GET ALL USER DETAIL LOGIC
  async getAllUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userModel.find(
        { __v: 0 },
        { __v: 0, createdAt: 0 }
      ).sort({ createdAt: -1 });
      SuccessHandler(200, users, "User Details Display Successfully", res);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // [ + ] Upload Profile Picture
  async uploadProfileImage(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore
      var user = await userModel.findById(req.user.id);
      // @ts-ignore
      const file = req.file;
      const result = await uploadFile(file)
      // @ts-ignore
      user.profile.fileName = file.originalname
      // @ts-ignore
      user.profile.fileSize = file.size;
      // @ts-ignore
      user.profile.public_id = result.Key
      // @ts-ignore
      user.profile.url = result.Location
      // @ts-ignore
      user.save();
      SuccessHandler(200, user, "User Profile Uploaded Successfully", res);
    } catch (error: any) {
      return next(ErrorHandler.serverError(error));
    }
  },

  // [ + ] UPDATE USER PASSWORD
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const UserValidation = Joi.object({
        oldPassword: Joi.string().required().messages({
          "string.base": `User Name should be a type of 'text'`,
          "string.empty": `User Name cannot be an empty field`,
          "string.min": `User Name should have a minimum length of {3}`,
          "any.required": `User Name is a required field`,
        }),
        newPassword: Joi.string()
          .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
          .required(),
        confirmPassword: Joi.ref("newPassword"),
      });
      const { error } = UserValidation.validate(req.body);
      if (error) {
        return next(error);
      }

      if (req.body.newPassword || req.body.confirmPassword) {
        if (req.body.newPassword !== req.body.confirmPassword) {
          return next(
            ErrorHandler.unAuthorized(
              "Confirm Password & Password Must Be Same"
            )
          );
        }
      }

      // @ts-ignore
      const user = await userModel.findById(req.user.id).select("+password");
      // @ts-ignore
      const isPasswordMatched = await user.comparePassword(
        req.body.oldPassword
      );
      if (!isPasswordMatched) {
        return next(ErrorHandler.notFound("Old Password Is Incorrect"));
      }

      //@ts-ignore
      user.password = req.body.newPassword;
      //@ts-ignore
      await user.save();
      SendToken(user, 200, res, "password Change");
      SuccessHandler(200, user, "Password Change Successfully", res);
    } catch (error: any) {
      return next(ErrorHandler.serverError(error));
    }
  },

  // [ + ] GET SINGLE USER LOGIC
  async getSingleUser(req: Request, res: Response, next: NextFunction) {
    try {
      const testId = CheckMongoId(req.params.id);
      if (!testId) {
        return next(ErrorHandler.wrongCredentials("Wrong MongoDB Id"));
      }
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

  // [ + ] UPDATE USER ROLE LOGIC
  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    const testId = CheckMongoId(req.params.id);
    if (!testId) {
      return next(ErrorHandler.wrongCredentials("Wrong MongoDB Id"));
    }
    const UserValidation = Joi.object({
      name: Joi.string().trim().min(3).max(30).messages({
        "string.base": `User Name should be a type of 'text'`,
        "string.empty": `User Name cannot be an empty field`,
        "string.min": `User Name should have a minimum length of {3}`,
        "any.required": `User Name is a required field`,
      }),
      email: Joi.string().email().trim().messages({
        "string.base": `User Email should be a type of 'text'`,
        "string.empty": `User Email cannot be an empty field`,
        "any.required": `User Email is a required field`,
      }),
      role: Joi.string().required(),
    });
    const { error } = UserValidation.validate(req.body);
    if (error) {
      return next(error);
    }
    try {
      const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role || "user",
      };

      const userData: any = await userModel.findById(req.params.id);
      if (userData.name !== req.body.name) {
        return next(new ErrorHandler("You Can't Change The User Name", 400));
      }
      if (userData.email !== req.body.email) {
        return next(new ErrorHandler("You Can't Change The User Email", 400));
      }
      if (userData.status != "Active") {
        return next(
          new ErrorHandler(
            "This user is not active user, you only change the active user role",
            400
          )
        );
      }
      if (userData.role == req.body.role) {
        return next(
          new ErrorHandler(
            "It's Seems Like You Are Not Changing the User Role",
            400
          )
        );
      }

      let updatedData = await userModel.findByIdAndUpdate(
        req.params.id,
        newUserData,
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );

      SuccessHandler(200, updatedData, "User Role Updated", res);
    } catch (error: any) {
      return new ErrorHandler(error, 500);
    }
  },

  // [ + ] UPDATE USER DETAIL LOGIC
  async updateUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const testId = CheckMongoId(req.params.id);
      if (!testId) {
        return next(ErrorHandler.wrongCredentials("Wrong MongoDB Id"));
      }
      const UserValidation = Joi.object({
        name: Joi.string().trim().min(3).max(30).messages({
          "string.base": `User Name should be a type of 'text'`,
          "string.min": `User Name should have a minimum length of {3}`,
        }),
        email: Joi.string().email().trim().messages({
          "string.base": `User Email should be a type of 'text'`,
        }),
        profile_img: Joi.string(),
      });
      const { error } = UserValidation.validate(req.body);
      if (error) {
        return next(error);
      }
      if (req.body.email) {
        const userEmailCheck = await userModel.exists({
          email: req.body.email,
        });
        if (userEmailCheck) {
          return next(new ErrorHandler("This email is already taken", 409));
        }
      }

      const newUserData = {
        name: req.body.name,
        email: req.body.email,
      };
      if (req.body.profile !== "" && req.body.profile !== undefined) {
        // @ts-ignore
        const user = await userModel.findById(req.user.id);
        // @ts-ignore
        const imageId = user.profile.public_id;
        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.profile, {
          folder: "profile",
          width: 150,
          crop: "scale",
        });
        // @ts-ignore
        newUserData.profile = {
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

  // [ + ] Delete User - Admin
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const testId = CheckMongoId(req.params.id);
      if (!testId) {
        return next(ErrorHandler.wrongCredentials("Wrong MongoDB Id"));
      }
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
  },

  // [ + ] DELETE USER LOGIC
  async deactivateAccount(req: Request, res: Response, next: NextFunction) {

    try {
      // @ts-ignore
      const user = await userModel.findById(req.user.id);

      if (!user) {
        return next(
          // @ts-ignore
          new ErrorHandler(`User does not exist with Id: ${req.user.id}`, 400)
        );
      }
      // @ts-ignore
      let userStatus = user.status;

      let DeactivatedUser = {
        status: "Deactivate",
      };
      let updatedUser = await userModel.findByIdAndUpdate(
        user.id,
        DeactivatedUser,
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );
      let message = `We are so sorry mail here after user delete account permenantly`;
      const afterDeleteMail = await SendEmail({
        email: user.email,
        subject: `Delete Account Permenantly`,
        message,
      });

      if (!afterDeleteMail) {
        return next(
          new ErrorHandler(
            "Something Error Occurred Please Try After Some Time",
            422
          )
        );
      }
      res.status(200).json({
        success: true,
        updatedUser,
        message: "User Account Removed Successfully",
      });
    } catch (error: any) {
      return next(ErrorHandler.serverError(error));
    }
  },

  // [ + ] BLOCK USER  BY ADMIN LOGIC
  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const testId = CheckMongoId(req.params.id);
      if (!testId) {
        return next(ErrorHandler.wrongCredentials("Wrong MongoDB Id"));
      }
      const user = await userModel.findById(req.params.id);

      if (!user) {
        return next(ErrorHandler.notFound(`User Not Found`));
      }
      // @ts-ignore
      let userStatus = user.status;

      let DeactivatedUser = {
        status: "Blocked",
      };

      let updatedUser = await userModel.findByIdAndUpdate(
        req.params.id,
        DeactivatedUser,
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );

      res.status(200).json({
        success: true,
        updatedUser,
        message: "User Blocked Successfully By Admin",
      });
    } catch (error: any) {
      return next(ErrorHandler.serverError(error));
    }
  }
};

export default userController;