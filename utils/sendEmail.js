import { Resend } from "resend";

// console.log(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
  const response = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  return response;
};

export default sendEmail;