import "dotenv/config";
import nodemailer from "nodemailer";
import { EMAIL_PASS, EMAIL_USER } from "../config/constans.js";
const transporter = nodemailer.createTransport({
  
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.log("SMTP Error:", error.message);
  } else {
    console.log("SMTP Server Ready");
  }
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Saree Platform" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;