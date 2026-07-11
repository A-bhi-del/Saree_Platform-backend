export const otpTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 30px; background:#f8f8f8">
      <div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:10px">

        <h2 style="color:#7c2d12">
          Saree Platform
        </h2>

        <p>Your OTP for verify your Account</p>

        <h1
          style="
            letter-spacing:8px;
            text-align:center;
            color:#be123c;
          "
        >
          ${otp}
        </h1>

        <p>This OTP will expire in 5 minutes.</p>

      </div>
    </div>
  `;
};