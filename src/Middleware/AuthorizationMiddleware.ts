import { ErrorHandler } from "../Utils";
import { NextFunction, Request, Response } from "express";

const authorizationRoles = (...roles: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `You are not allowed to access this resources`,
          403
        )
      );
    }
    next();
  };
};

export default authorizationRoles;



