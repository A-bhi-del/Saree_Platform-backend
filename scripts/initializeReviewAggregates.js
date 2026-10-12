import mongoose from "mongoose";
import dotenv from "dotenv";
import Saree from "../models/Saree.js";

dotenv.config();

async function initializeReviewAggregates() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    console.log("\nInitializing review aggregates for existing sarees...");

    const result = await Saree.updateMany(
      {
        $or: [
          { averageRating: { $exists: false } },
          { totalReviews: { $exists: false } },
          { ratingDistribution: { $exists: false } },
          { verifiedReviewCount: { $exists: false } }
        ]
      },
      {
        $set: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          },
          verifiedReviewCount: 0
        }
      }
    );

    console.log(`\nUpdated ${result.modifiedCount} sarees with default review aggregates`);
    console.log("Migration completed successfully!");

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
    process.exit(0);
  }
}

initializeReviewAggregates();
