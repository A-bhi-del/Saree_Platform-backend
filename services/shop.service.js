import User from "../models/User.js";
import Saree from "../models/Saree.js";
import Sale from "../models/Sale.js";

import ApiError from "../utils/ApiError.js";

import { getCache, setCache } from "../utils/cache.js";

export const getShopDetails = async (adminId, customerId) => {
    const cacheKey = `shop:${adminId}`;

    const cachedShop = await getCache(cacheKey);

    if (cachedShop) {
        console.log("✅ Redis Cache Hit");
        return {
            ...cachedShop,
            isFavorite,
        };
    }
    console.log("❌ Redis Cache Miss");

    const customer = await User.findById(customerId).select(
        "favoriteAdmins"
    );

    const isFavorite = customer.favoriteAdmins.some(
        (id) => id.toString() === adminId.toString()
    );

    if (cachedShop) {
        return {
            ...cachedShop,
            isFavorite,
        };
    }

    const [admin, sale, sarees] = await Promise.all([
        User.findOne({
            _id: adminId,
            role: "admin",
        }).select("-password"),

        Sale.findOne({
            admin: adminId,
            startDate: {
                $lte: new Date(),
            },
            endDate: {
                $gte: new Date(),
            },
        }),

        Saree.find({
            admin: adminId,
        }).populate(
            "admin",
            "name email profileImage"
        ),
    ]);

    if (!admin) {
        throw new ApiError(404, "Shop not found");
    }

    const response = {
        shop: admin,

        sale,

        sarees,

        statistics: {
            totalSarees: sarees.length,
        },
    };

    await setCache(cacheKey, response, 300);

    return {
        ...response,
        isFavorite,
    };
};