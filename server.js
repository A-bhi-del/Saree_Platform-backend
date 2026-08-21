import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import sareeRoutes from "./routes/saree.routes.js";
import requestRoutes from "./routes/request.routes.js";
import cookieParser from "cookie-parser";
import notificationRoutes from "./routes/notification.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import saleRoutes from "./routes/sale.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import {connectRedis} from "./config/redis.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import favoriteSareeRoutes from "./routes/favoriteSaree.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { CLIENT_URL } from "./config/constans.js";
import { startCronJobs } from "./cron/jobs.js";

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  CLIENT_URL,
].filter(Boolean);

app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Backend Running ");
});

app.use("/api/auth", authRoutes);
app.use("/api/sarees", sareeRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/favorite-sarees", favoriteSareeRoutes);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    startCronJobs();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();