import { NextFunction, Request, Response } from "express";
import { userModel, tokenModel } from "../Models";
import Joi from "joi";
import { CheckMongoId, ErrorHandler, GenerateOTP, SendEmail, SendTextMessage, SendToken, SuccessHandler } from "../Utils";
import { FRONTEND_URL, LOGIN_URL, TWILIO_PHONE_NUMBER } from "../../Config";
import crypto from "crypto";
import bcrypt from "bcrypt";
import Logger from "../../Config/Logger";
let NAMESPACE = "";
const authorizationController = {
  // [ + ] REGISTRATION LOGIC
  async registration(req: Request, res: Response, next: NextFunction) {

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
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'in'] } }).required(),
        password: Joi.string().min(4)
          .pattern(new RegExp("^[a-zA-Z0-9#?!@$%^&*-]{8,30}$"))
          .required(),
        confirmPassword: Joi.ref('password'),
        verified: Joi.boolean().default(false),
        role: Joi.string().default("user"),
        mobileNumber: Joi.number().required(),
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

      const { name, email, password, mobileNumber } = req.body;
      if (req.body.password) {
        if (req.body.password !== req.body.confirmPassword) {
          return next(
            ErrorHandler.unAuthorized(
              "Confirm Password & Password Must Be Same"
            )
          );
        }
      }
      try {
        const exist = await userModel.exists({ email: req.body.email });
        if (exist) {
          return next(ErrorHandler.alreadyExist("This email is already taken"));
        }
      } catch (err) {
        return next(err);
      }

      const user = await userModel.create({
        name,
        email,
        password,
        mobileNumber
      });

      const token = await tokenModel.create({
        userId: user._id,
        // @ts-ignore
        otp: await GenerateOTP(),
      });

      const sendMessage = await SendTextMessage({
        phoneNumber: user.mobileNumber.toString().includes("+91")
          ? `${user.mobileNumber}`
          : `+91${user.mobileNumber}`,
        message: `Please verify your Mobile Number by Using the following OTP ${token.otp} to complete your Sign Up procedures. OTP is valid for 20 minutes.`,
      });
      // SendToken(user, 201, res);
      res.status(201).json({
        status: "Pending",
        code: 201,
        data: user,
        message:
          "A Text Message send to your account please verify your Mobile Number",
      });
      // SendToken(user, 201, res, "Account Created Successfully");

    } catch (error: any) {

      return next(ErrorHandler.serverError(error));
    }
  },

  // [ + ] LOGIN USER LOGIC
  async login(req: Request, res: Response, next: NextFunction) {
    NAMESPACE = "Login";
    try {
      const LoginSchema = Joi.object({
        email: Joi.string().email().trim().required().messages({
          "string.base": `User Email should be a type of 'text'`,
          "string.empty": `User Email cannot be an empty field`,
          "any.required": `User Email is a required field`,
        }),
        password: Joi.string()
          .pattern(new RegExp("^[a-zA-Z0-9#?!@$%^&*-]{8,30}$"))
          .required(),
        userIp: Joi.string().default("0.0.0.0"),
        userLocation: Joi.string().default("Some Location"),
      });
      const { error } = LoginSchema.validate(req.body);
      if (error) {
        return next(error);
      }

      const { email, password } = req.body;

      const user = await userModel
        .findOne({ email: email })
        .select("+password");

      if (!user) {
        return next(ErrorHandler.wrongCredentials("Invalid Email and password"));
      }

      if (!user.verified) {
        return next(
          ErrorHandler.unAuthorized("please verify your email address")
        );
      }

      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return next(ErrorHandler.wrongCredentials("Invalid Email and password"));
      }

      if (user.status === "Deactivate") {
        const sendActivateAccountInfo = await SendEmail({
          email: user.email,
          subject: `Reactivate Your Account`,
          templateName: "deactivateAccount",
          context: {
            username: user.name,
          },
        });
        if (!sendActivateAccountInfo) {
          return next(
            ErrorHandler.serverError(
              "Something Error Occurred Please Try After Some Time"
            )
          );
        }

        return next(
          ErrorHandler.notFound(
            "It Seem's You have deleted Your Account Please Check Your Mail For More Details"
          )
        );
      }

      if (user.status === "Blocked") {
        let message = `Administrator Have Blocked Your Account Because Some Inappropriate Activity Has Done From Your Account`;
        const sendActivateAccountInfo = await SendEmail({
          email: user.email,
          subject: `Terms & Conditions`,
          message,
        });
        if (!sendActivateAccountInfo) {
          return next(
            ErrorHandler.serverError(
              "Something Error Occurred Please Try After Some Time"
            )
          );
        }
        return next(
          ErrorHandler.notFound(
            "It Seem's Administrator have Blocked Your Account Please Check Your Mail For More Details"
          )
        );
      }

      let current = new Date();
      let currenttimeDate = `${current.toLocaleTimeString()} - ${current.toLocaleDateString()}`;
      const AccountLogin = await SendEmail({
        email: user.email,
        subject: `Someone Is Login From Your Account`,
        templateName: "loginAccount",
        context: {
          username: user.email,
          UserIP: `Ip:- ${req.socket.remoteAddress}`,
          userLocation: `Location:- ${user.userLocation}`,
          time: currenttimeDate,
        },
      });
      if (!AccountLogin) {
        return next(
          ErrorHandler.serverError(
            "Something Error Occurred Please Try After Some Time"
          )
        );
      }
      SendToken(user, 200, res, "Login Successfully");
    } catch (error: any) {
      return next(ErrorHandler.serverError("Something Error Occurred Please Try After Some Time"));
    }
  },

  async resendVerifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const testId = CheckMongoId(req.body.id);
      if (!testId) {
        return next(ErrorHandler.wrongCredentials("Wrong MongoDB Id"));
      }
      const user = await userModel.findById(req.body.id);
      // @ts-ignore
      if (user.verified) {
        return next(ErrorHandler.unAuthorized("User Is Already Verified"));
      }
      // @ts-ignore
      const tokenremove = await tokenModel.find({ userId: user.id });

      if (tokenremove) {
        tokenremove.map(async (data) => {
          return await tokenModel.findByIdAndDelete(data._id);
        });
      }
      const token = await tokenModel.create({
        // @ts-ignore
        userId: user.id,
        token: crypto.randomBytes(32).toString("hex"),
      });
      // @ts-ignore
      const url = `${FRONTEND_URL}/users/${user._id}/verify/${token.token}`;

      const sendVerifyMail = await SendEmail({
        email: user?.email,
        subject: `Email Verification`,
        templateName: "verifyEmail",
        context: {
          username: user?.name,
          url: url,
        },
      });
      if (!sendVerifyMail) {
        return next(
          ErrorHandler.serverError(
            "Something Error Occurred Please Try After Some Time"
          )
        );
      }
      // SendToken(user, 201, res);
      res.status(201).json({
        status: true,
        code: 200,
        data: [],
        message: "Mail Resend Successfully",
      });
    } catch (err: any) {
      next(ErrorHandler.serverError(err));
    }
  },

  // [ + ] FORGOT PASSWORD USER LOGIC
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    NAMESPACE = "Forgot Password";
    const forgotPasswordSchema = Joi.object({
      email: Joi.string().email().trim().required().messages({
        "string.base": `User Email should be a type of 'text'`,
        "string.empty": `User Email cannot be an empty field`,
        "any.required": `User Email is a required field`,
      }),
      userIp: Joi.string().default("0.0.0.0"),
      userLocation: Joi.string().default("Some Location"),
    });
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return next(ErrorHandler.notFound("User Not Found"));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${FRONTEND_URL}/password/reset/${resetToken}`;

    const message = `Your password reset token is:- ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it\n\n `;

    try {
      await SendEmail({
        email: user.email,
        subject: `Password Recovery Email`,
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
      return next(ErrorHandler.serverError(error.message));
    }
  },

  // [ + ] RESET PASSWORD USER LOGIC
  async passwordReset(req: Request, res: Response, next: NextFunction) {
    NAMESPACE = "Password Reset";
    try {
      const ResetSchema = Joi.object({
        password: Joi.string()
          .pattern(new RegExp("^[a-zA-Z0-9#?!@$%^&*-]{8,30}$"))
          .required(),
        // confirmPassword: Joi.ref("password"),
        // For Custom Message we are using this
        confirmPassword: Joi.string().required(),
        userIp: Joi.string().default("0.0.0.0"),
        userLocation: Joi.string().default("Some Location"),
      });
      const { error } = ResetSchema.validate(req.body);
      if (error) {
        return next(error);
      }

      if (req.body.password || req.body.confirmPassword) {
        if (req.body.password !== req.body.confirmPassword) {
          return next(
            ErrorHandler.unAuthorized(
              "Confirm Password & Password Must Be Same"
            )
          );
        }
      }

      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
      const user = await userModel.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      }).select("+password");
      if (!user) {
        return next(
          new ErrorHandler(
            "Reset password token is Invalid or has been expired",
            404
          )
        );
      }

      if (req.body.password) {
        let newPassword = req.body.password;
        let result = await bcrypt.hash(newPassword, 10);
        let samePassword = await bcrypt.compare(result, user.password);
        if (samePassword) {
          return next(
            ErrorHandler.alreadyExist(
              "You Can't use old password, please enter new password"
            )
          );
        }
      }
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      SuccessHandler(
        200,
        user,
        "Your Password is Reset Successfully.Now, Please Login",
        res
      );
    } catch (error: any) {
      return next(new ErrorHandler(error, 500));
    }
  },

  // [ + ] LOGOUT LOGIC
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
