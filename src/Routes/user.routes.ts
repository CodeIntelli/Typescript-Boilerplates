import express from "express";
import { userController } from "../Controller";
import { isAuthenticatedUser, authorizationRoles, Upload } from "../Middleware/index";
const userRoutes = express.Router();
// [ + ]After Login this url is used for user


userRoutes.get("/profile", isAuthenticatedUser, userController.getUserDetails);
userRoutes.get("/getProfle/:id", isAuthenticatedUser, userController.getProfile);
userRoutes.put(
  "/changePassword",
  isAuthenticatedUser,
  userController.changePassword
);

userRoutes.put(
  "/edit_profile",
  isAuthenticatedUser,
  userController.updateUserDetails
);

userRoutes.put(
  "/deactivate",
  isAuthenticatedUser,
  userController.deactivateAccount
);

// userRoutes.post(
//   "/profile_image",
//   isAuthenticatedUser,
//   Upload.single("profile_img"),
//   userController.uploadProfileImage
// );

// [ - ] old code
// userRoutes.put("/setProfile", isAuthenticatedUser, Upload.single('profile'), userController.setProfile);

// [ + ] Admin Credentials
userRoutes.get(
  "/admin/user",
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

userRoutes.put(
  "/admin/user/block/:id",
  isAuthenticatedUser,
  authorizationRoles("admin"),
  userController.blockUser
);

export default userRoutes;