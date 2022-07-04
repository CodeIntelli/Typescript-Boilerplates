import express from "express";
import Logger from "../Config/Logger";
import "./Database";
import { PORT } from "../Config";
import { authenticationRoutes, userRoutes } from "./Routes";
import cors from "cors";
import errorDetails from "./Middleware/ErrorMiddleware";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cloudinary from "cloudinary";
import { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } from "../Config"
const app = express();
const NAMESPACE = "SERVER";
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// todo: All Routes Declare Here
app.use('/api/v1', userRoutes);
app.use('/api/v1', authenticationRoutes);


// todo:  Middleware for Error
app.use(errorDetails);
// ? when we declare any undefine variable then this error occur so we can handle this error here
process.on("uncaughtException", (error: any) => {
  console.log(
    `Shutting down the server due to uncaught exception:${error.message}`
  );
  process.exit(1);
});

// Cloudinary Configuration
// @ts-ignore
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
});


let server = app.listen(PORT, () => {
  Logger.info(NAMESPACE, `Server Listing At http://localhost:${PORT}`);
})

// * unhandled promise rejection: it occur when we are put incorrect mongodb string in short it accept all mongodb connection errors
//  * when we are handling this error we dont need to put catch block in database connection file
process.on("unhandledRejection", (error: any) => {
  console.log(
    `Shutting down the server due to unhandled promise rejection  : ${error.message}`
  );
  server.close(() => {
    process.exit(1);
  });
});
