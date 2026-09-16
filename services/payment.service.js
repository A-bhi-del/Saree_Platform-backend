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