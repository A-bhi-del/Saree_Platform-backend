import cron from "node-cron";
import Notification from "../models/Notification.js";
import * as couponService from "../services/coupon.service.js";

export const startCronJobs = () => {
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

    cron.schedule("*/5 * * * *", async () => {
        try {
            console.log("Running coupon reservation expiry job...");
            
            const result = await couponService.expireOldReservations();
            
            if (result.expiredCount > 0) {
                console.log(`Expired ${result.expiredCount} coupon reservations`);
            }
        } catch (error) {
            console.error("Coupon expiry cron job failed:", error);
        }
    });
};