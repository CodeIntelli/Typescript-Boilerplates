import express, { Request, Response, NextFunction } from "express";
import { userController } from "../Controller";
import { isAuthenticatedUser, authorizationRoles,Upload }  from "../Middleware/index";

const userRoutes = express.Router();

userRoutes.get("/profile", isAuthenticatedUser, userController.getUserDetails);
userRoutes.get("/getProfle/:id", isAuthenticatedUser, userController.getProfile);
userRoutes.put(
  "/changePassword",
  isAuthenticatedUser,
  userController.updatePassword
);

userRoutes.put(
  "/edit_profile",
  isAuthenticatedUser,
  userController.updateUserDetails
);
userRoutes.put("/setProfile", isAuthenticatedUser, Upload.single('profile'), userController.setProfile);

// admin
userRoutes.get(
  "/details",
  isAuthenticatedUser,
  authorizationRoles("admin"),
  userController.getAllUserDetails
);
userRoutes.get(
  "/admin/user/:id",
  isAuthenticatedUser,
  authorizationRoles("admin"),
  userController.getSingleUser
);
userRoutes.put(
  "/admin/user/:id",
  isAuthenticatedUser,
  authorizationRoles("admin"),
  userController.updateUserRole
);
userRoutes.delete(
  "/admin/user/:id",
  isAuthenticatedUser,
  authorizationRoles("admin"),
  userController.deleteUser
);


export default userRoutes;