import nodemailer from "nodemailer";
import config from "./config/config.js";


export const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: config.gmailAccount,
      pass: config.gmailAppPassword,
    },
  });


  export const mailOptions = (html, subject, email, attachments) => {

    const mailOptions = {
        from: "uwu" + config.gmailAccount,
        to: email,
        subject: subject,
        html: html,
        attachments: attachments,
      };

      return mailOptions
  }