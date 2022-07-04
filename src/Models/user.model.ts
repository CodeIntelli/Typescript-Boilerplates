import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { JWT_EXPIRE, JWT_SECRET } from "../../Config";
import { userModelInterface } from '../Interfaces';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name Cannot exceed 30 characters"],
    minLength: [4, "Name Should have more than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minLength: [4, "Password should not be greater than 4 characters"],
    select: false,
  },
  // profile: {
  //   fileName: {
  //     type: String,
  //     required: true,
  //   },
  //   fileSize: {
  //     type: String,
  //     required: true,
  //   },
  //   public_id: {
  //     type: String,
  //     required: true,
  //     default: "userImage/tzsmxrevyes1xsuyujlk",
  //   },
  //   url: {
  //     type: String,
  //     required: true,
  //     default:
  //       "https://res.cloudinary.com/dm3gs2s0h/image/upload/v1650136405/userImage/tzsmxrevyes1xsuyujlk.png",
  //   },
  // },
  role: {
    type: String,
    default: "user",
  },
  verified: {
    type: Boolean,
    default: "false"
  },

  status: {
    type: String,
    default: "Active"
  },

  userIp: {
    type: String,
    required: true,
    default: "0.0.0.0"
  },

  userLocation: {
    type: String,
    required: true,
    default: "Some Location"
  },

  profile: {
    type: String,
    default: "https://img.favpng.com/2/12/12/computer-icons-portable-network-graphics-user-profile-avatar-png-favpng-L1ihcbxsHbnBKBvjjfBMFGbb7.jpg"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// bcrypt
userSchema.pre<userModelInterface>("save", async function (next) {
  let user = this as userModelInterface;
  if (!user.isModified("password")) {
    next();
  }
  user.password = await bcrypt.hash(user.password, 10);
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  let user = this as userModelInterface;
  return jwt.sign({ id: user._id }, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRE,
  });
};

// Compare Password
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  let userpass = this as userModelInterface;
  return await bcrypt.compare(candidatePassword, userpass.password);
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //* user will valid only for 15 min
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

let userModel = mongoose.model<userModelInterface>("User", userSchema);
export default userModel;
