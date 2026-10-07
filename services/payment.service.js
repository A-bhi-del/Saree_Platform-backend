import razorpay from "../config/razorpay.js";

export const createRazorpayOrder = async ({
  amount,
  receipt
}) => {
  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt
  };

  const razorpayOrder = await razorpay.orders.create(options);

  return razorpayOrder;
};


export const verifyRazorpaySignature = async ({
  orderId,
  paymentId,
  signature
}) => {
  const crypto = await import('crypto');
  const { RAZORPAY_API_KEY_SECRET } = await import('../config/constans.js');

  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_API_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};
