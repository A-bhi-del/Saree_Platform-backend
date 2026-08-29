import User from "../models/User.js"
import ApiError from "../utils/ApiError.js";

export const getAlladmins = async (adminId) => {
    const currentadmin = await User.findById(adminId);

    if (!currentadmin) {
        throw new ApiError(404, "Admin not found");
    }

    const admins = await User.find({
        role: "admin",
        _id: { $ne: adminId }, 
    })
        .select("name email profileImage shopName")
        .lean();
    
    return admins;
}