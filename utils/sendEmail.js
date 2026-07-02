import "dotenv/config";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// console.log(process.env.EMAIL_USER);
// console.log(process.env.EMAIL_PASS);
transporter.verify((error) => {
  if (error) {
    console.log("SMTP Error:", error.message);
  } else {
    console.log("SMTP Server Ready");
  }
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Saree Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;