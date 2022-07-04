import express, { Request, Response, NextFunction } from "express";
import { authorizationController } from "../Controller";
const authenticationRoutes = express.Router();

authenticationRoutes.post('/register', authorizationController.registration);
authenticationRoutes.get('/verifymail/:id/:token', authorizationController.verifyEmail);
authenticationRoutes.post('/login', authorizationController.login);
authenticationRoutes.post('/password/forgot', authorizationController.forgotPassword);
authenticationRoutes.put('/password/reset/:token', authorizationController.passwordReset);
authenticationRoutes.get('/logout', authorizationController.logout);

export default authenticationRoutes;