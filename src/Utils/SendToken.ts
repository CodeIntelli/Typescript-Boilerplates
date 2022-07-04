import { COOKIE_EXPIRE } from "../../Config";

// creating token and saving in cookie
const sendToken = (user:any, statusCode:number, res:any) => {
    let cookie_exp = COOKIE_EXPIRE as any;
  const token = user.getJWTToken();
  //   Option for cookie
  const option = {
    expires: new Date(Date.now() + cookie_exp  * 24 * 24 * 60 * 1000),
    httpOnly: true,
  };
  res.status(statusCode).cookie("token", token, option).json({
    success: true,
    user,
    token,
  });
};

export default sendToken;
