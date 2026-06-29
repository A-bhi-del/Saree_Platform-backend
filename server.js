import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import sareeRoutes from "./routes/saree.routes.js";
import requestRoutes from "./routes/request.routes.js";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/error.middleware.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Backend Running ");
});

app.use("/api/auth", authRoutes);
app.use("/api/sarees", sareeRoutes);
app.use("/api/requests", requestRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();