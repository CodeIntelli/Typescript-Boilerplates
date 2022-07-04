import nodeMailer from "nodemailer";
import {
  SMTP_MAIL,
  SMTP_SERVICE,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_PASS,
} from "../../Config";
import ErrorHandler from "./ErrorHandler";

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
    const mailOptions = {
      from: user,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };
    return await transporter.sendMail(mailOptions);
  } catch (error: any) {
    return new ErrorHandler(error.message, 500);
  }

  //   res.status(200).json({ success: true, message: "mail send successfully" });
};
export default sendEmail;
