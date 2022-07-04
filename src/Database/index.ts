import mongoose from "mongoose";
import { DB_URL } from "../../Config";
import Logger from "../../Config/Logger";

let DB_LINK = DB_URL as string;
let NAMESPACE = "CONNECTIONS";
mongoose
  .connect(DB_LINK, {
    // @ts-ignore
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((data) => {
    Logger.info(NAMESPACE,`Mongo DB Connected:- ${data.connection.host}`);
}).catch((error)=>{
    Logger.error(NAMESPACE,error);
    process.exit(1);
});
