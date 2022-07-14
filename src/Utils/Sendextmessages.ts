/* 
@Info:- 10 Best Node.js SMS API Libraries
// Referance Link :- https://openbase.com/categories/js/best-nodejs-sms-api-libraries

1. Twilio 
2. twilio-api
3. plivo
4. telnyx
5. fast-two-SMS
6. node-sms-ru
7. nexmoapi
8. modem
9. jusibe
10. app-notify

*/
import {
    TWILIO_PHONE_NUMBER,
    TWILIO_AUTH_SID,
    TWILIO_AUTH_TOKEN,
} from "../../Config";
let twilio = require("twilio")(TWILIO_AUTH_SID, TWILIO_AUTH_TOKEN);

const SendTextMessage = (messageContext:any) => {
    twilio.messages
        .create({
            from: TWILIO_PHONE_NUMBER,
            to: messageContext.phoneNumber,
            body: messageContext.message,
        })
        .then((res:any) => {
            console.log("message Sent");
        })
        .catch((err:any) => {
            console.error(err);
        });
};

export default SendTextMessage;
