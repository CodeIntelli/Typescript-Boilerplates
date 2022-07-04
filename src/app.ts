import express from "express";
import Logger from "../Config/Logger";
import "./Database";
import { PORT } from "../Config";
import { authenticationRoutes, userRoutes } from "./Routes";
import cors from "cors";
import errorDetails from "./Middleware/ErrorMiddleware";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const app = express();
const NAMESPACE = "SERVER";
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api/v1', userRoutes);
app.use('/api/v1', authenticationRoutes);


// todo:  Middleware for Error
app.use(errorDetails);

process.on("uncaughtException", (error: any) => {
  console.log(
    `Shutting down the server due to uncaught exception:${error.message}`
  );
  process.exit(1);
});


let server = app.listen(PORT, () => {
  Logger.info(NAMESPACE, `Server Listing At http://localhost:${PORT}`);
})


process.on("unhandledRejection", (error: any) => {
  console.log(
    `Shutting down the server due to unhandled promise rejection  : ${error.message}`
  );
  server.close(() => {
    process.exit(1);
  });
});
