import { NextFunction, Request, Response } from "express";
import { userModel, tokenModel } from "../Models";
import Joi from "joi";
import { ErrorHandler, SendEmail, SendToken } from "../Utils";
import { FRONTEND_URL, LOGIN_URL } from "../../Config";
import crypto from "crypto";
import Logger from "../../Config/Logger";
let NAMESPACE = "";
const authorizationController = {
  async registration(req: Request, res: Response, next: NextFunction) {
    NAMESPACE = "Registration";
    try {

      // ~ validation start

      // create schema object
      const schema = Joi.object({
        name: Joi.string().min(4).max(30).required().messages({
          "string.base": `Name should be a type of 'text'`,
          "string.empty": `Name cannot be an empty field`,
          "string.min": `Name should have a minimum length of {4} and maximum length of {30}`,
          "any.required": `Name is a required field`,
        }),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com','in'] } }).required(),
        password: Joi.string().min(4).max(8).pattern(new RegExp('^[a-zA-Z0-9]{4,20}$')).required(),
        confirmPassword: Joi.ref('password'),
        verified: Joi.boolean().default(false),
        role: Joi.string().default("user"),
        status: Joi.string().default("Active"),
        userIp: Joi.string().default("0.0.0.0"),
        userLocation: Joi.string().default("Some Location"),
      })


      // validate request body against schema
      const { error } = schema.validate(req.body)

      if (error) {
        return next(new ErrorHandler(`Validation error: ${error.details.map(x => x.message).join(', ')}`, 500))
      }
      // ~ validation end
      else {
        const { name, email, password } = req.body;
      
        const user = await userModel.create({
          name: name,
          email,
          password,

        });
        let token = await new tokenModel({
          userId: user._id,
          token: crypto.randomBytes(20).toString("hex")
        }).save();

        const message = `${FRONTEND_URL}/${user._id}/verify/${token.token}`;

        const sendVerifyMail = await SendEmail({
          email: user.email,
          subject: `${user.name} verification link`,
          message,
        });
        if (!sendVerifyMail) {
          return next(
            new ErrorHandler(
              'Something Error Occurred Please Try After Some Time',
              422
            )
          );
        }
        res.status(200).json({
          success: "Pending",
          message: `Email sent to ${user.email} successfully please verify your email to reference link`,
        });
        // sendToken(user, 201, res);
      }
    } catch (error: any) {

      return next(new ErrorHandler(error, 500));
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userModel.findOne({ _id: req.params.id });
      if (!user) {
        return next(new ErrorHandler('Invalid Verification Link', 400));
      }
      const token = await tokenModel.findOne({
        userId: user._id,
        token: req.params.token,
      });
      if (!token) {
        return next(new ErrorHandler('Invalid Verification Link', 400));
      }

      await userModel.findByIdAndUpdate(
        req.params.id,
        {
          verified: true,
        },
        { new: true, runValidators: true, useFindAndModify: false }
      );
      await token.remove();

      res.status(200).send({
        success: true,
        message: `Email Verification Successfully You can login now ${LOGIN_URL}`,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    NAMESPACE = "Login";
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
      }
      let user = await userModel
        .findOne({ email: email })
        .select("+password");

      if (!user) {
        return next(new ErrorHandler("Invalid Email and password", 400));
      }
      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email and password", 400));
      }
      if (!user.verified) {
        return next(new ErrorHandler('please verify your email address', 400));
      }
      const message = `login succesfully set your profile ${FRONTEND_URL}/profile`;
      user = await userModel
        .findOne({ email: email })
        .select("-password");
      // const token = user.getJWTToken();
      // res.json({mesaage:message})
      SendToken(user, 200, res);
    } catch (error: any) {
      console.log(error)
      return next(new ErrorHandler(error, 500));
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    NAMESPACE = "Forgot Password";
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return next(new ErrorHandler("User Not Found", 404));
      // return res.status(404).json({msg:"user not found"});
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${FRONTEND_URL}/password/reset/${resetToken}`;

    const message = `Your password reset token is:- ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it\n\n `;

    try {
      await SendEmail({
        email: user.email,
        subject: `${user.name} Password Recovery`,
        message,
      });
      Logger.info(NAMESPACE, `${message}`);
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error: any) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorHandler(error.message, 500));
    }
  },
  async passwordReset(req: Request, res: Response, next: NextFunction) {
    NAMESPACE = "Password Reset";
    try {
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
      const user = await userModel.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
      if (!user) {
        return next(
          new ErrorHandler(
            "Reset password token is Invalid or has been expired",
            404
          )
        );
      }

      if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password doesn't match", 400));
      }
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      SendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error, 500));
    }
  },
  async logout(req: Request, res: Response, next: NextFunction) {
    NAMESPACE = "Logout";
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      res.status(200).json({
        success: true,
        message: "Successfully Logout",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error, 500));
    }
  },
};

export default authorizationController;
