                              import { JWT_SECRET } from "../../Config";
import { userModel } from "../Models";
import { ErrorHandler } from "../Utils";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

const isAuthenticatedUser = async (req: Request, res: Response, next: NextFunction) => {
  let secret = JWT_SECRET as string;
  try {
    let authToken = req.headers.authorization || req.cookies.token;
    if (!authToken) {
      console.log("token not found");
      return next(
        new ErrorHandler("Please Login to access this resources", 401)
      );
    }

    const token = authToken.split(" ")[1];
    if (token === "undefined") {
      return new ErrorHandler("Please Login to access this resources", 401);
    }
    const decodeData = jwt.verify(token, secret);
    //@ts-ignore
    req.user = await userModel.findById(decodeData.id);
    // @ts-ignore
    next();
  } catch (error) {
    return next(new ErrorHandler(error, 401));
  }
};


export default isAuthenticatedUser;
