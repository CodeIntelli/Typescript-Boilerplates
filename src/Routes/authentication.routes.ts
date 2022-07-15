import express from "express";
import { authorizationController } from "../Controller";
const authenticationRoutes = express.Router();

// [ + ] Authenticate Route
authenticationRoutes.post('/register', authorizationController.registration);
authenticationRoutes.post('/login', authorizationController.login);
authenticationRoutes.post("/resendVerifyEmail", authorizationController.resendVerifyEmail);
authenticationRoutes.post('/password/forgot', authorizationController.forgotPassword);
authenticationRoutes.put('/password/reset/:token', authorizationController.passwordReset);
authenticationRoutes.get('/logout', authorizationController.logout);

export default authenticationRoutes;