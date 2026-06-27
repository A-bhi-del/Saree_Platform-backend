import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("⏳ MongoDB Connection Attempting");
    // console.log(process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.log("MongoDB Connection Failed");
    console.log(error.message);
    process.exit(1);
  }
};

export default connectDB;