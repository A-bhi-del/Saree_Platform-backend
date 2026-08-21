import cron from "node-cron";
import Notification from "../models/Notification.js";

export const startCronJobs = () => {
    // Runs every day at midnight
    console.log("Cron Job : i am running");
    cron.schedule("0 0 * * *", async () => {
        try {
            console.log("Running daily cron job...");

            await Notification.deleteMany({
                createdAt: {
                    $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            })
            
        } catch (error) {
            console.error("Cron job failed:", error);
        }
    });
};