import nodeMailer from "nodemailer";
import {
  SMTP_MAIL,
  SMTP_SERVICE,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_PASS,
} from "../../Config";
import ErrorHandler from "./ErrorHandler";
import path from 'path';

import hbs from "nodemailer-express-handlebars";
const sendEmail = async (options: any) => {
  
  //   const accessToken = await OAuth2Client.getAccessToken();
  try {
    // let host = SMTP_HOST as any;
    let port = SMTP_PORT as any;
    let service = SMTP_SERVICE as any;
    let user = SMTP_MAIL as any;
    let pass = SMTP_PASS as any;
    const transporter = nodeMailer.createTransport({
      service,
      secure: false,
      port,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    const handlerbarsOption = {
      viewEngine: {
        extName: ".html",
        partialsDir: path.resolve("./src/Templates"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./src/Templates"),
      extName: ".handlebars",
    };
    // @ts-ignore
    transporter.use("compile", hbs(handlerbarsOption));
    const mailOptions = {
      from: SMTP_MAIL,
      to: options.email,
      subject: options.subject,
      template: options.templateName,
      context: options.context,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error: any) {
    
    return ErrorHandler.serverError(error.message);
  }

  //   res.status(200).json({ success: true, message: "mail send successfully" });
};
export default sendEmail;
