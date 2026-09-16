import Rezorpay from "razorpay";
import { RAZORPAY_API_KEY, RAZORPAY_API_KEY_SECRET } from "./constans.js";

const razorpay = new Rezorpay({
    key_id: RAZORPAY_API_KEY,
    key_secret: RAZORPAY_API_KEY_SECRET,
})

export default razorpay;