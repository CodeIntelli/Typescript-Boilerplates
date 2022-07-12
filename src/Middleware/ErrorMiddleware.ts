import { DEBUG_MODE } from "../../Config"
import { ValidationError } from "joi";
import { NextFunction, Request, Response } from "express";
import consola from "consola";
import { ErrorHandler } from "../Utils";
import Logger from "../../Config/Logger";

const errorDetails = (error: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500
  let errdata = {
    success: false,
    code: statusCode,
    data: [],
    message: "INTERNAL SERVER ERROR",
    // this is good for development not for production
    ...(DEBUG_MODE === "true" && { originalError: error.message }),
  };
  Logger.error("ERROR HANDLER", error);
  //   it only tell us the object we can get is of what object or class
  if (error instanceof ValidationError) {
    statusCode = 422;
    errdata = {
      success: false,
      code: statusCode,
      data: [],
      message: error.message,
    };
    // @ts-ignore
    Logger.error("ERROR HANDLER", errdata);
  }

  if (error instanceof ErrorHandler) {
    statusCode = error.statusCode;
    errdata = {
      success: false,
      code: statusCode,
      data: [],
      message: error.message,
    };
    // @ts-ignore
    Logger.error("ERROR HANDLER @@@@@@", statusCode);
    // consola.error(error.message);
  }

  // Wrong Mongodb ID Error
  if (error.name === "CastError") {
    const message = `Resource not found Invalid: ${error.path}`;
    error = new ErrorHandler(message, 400);
  }

  // Mongoose duplicate error
  if (error.code === 11000) {
    const message = `Duplicate ${Object.keys(error.keyValue)} Entered`;
    error = new ErrorHandler(message, 400);
  }

  //Wrong JWT Token
  if (error.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, try again`;
    error = new ErrorHandler(message, 400);
  }

  // JWT Expire Token
  if (error.name === "TokenExpiredError") {
    const message = `Json Web Token is Expired, try again`;
    error = new ErrorHandler(message, 400);
  }
  // consola.log(error);
  // res.status(error.statusCode).json({
  //   success: false,
  //   error: error,
  //   message: error.message
  // });


  return res.status(statusCode).json(errdata);
};

export default errorDetails;
