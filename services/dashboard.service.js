import Saree from "../models/Saree.js";
import Sale from "../models/Sale.js";
import Request from "../models/Request.js";
import User from "../models/User.js";

const getSareeStats = async (adminId) => {
  const stats = await Saree.aggregate([
    {
      $match: {
        admin: adminId,
      },
    },
    {
      $group: {
        _id: null,

        totalSarees: {
          $sum: 1,
        },

        availableSarees: {
          $sum: {
            $cond: ["$isAvailable", 1, 0],
          },
        },

        outOfStock: {
          $sum: {
            $cond: [
              {
                $eq: ["$stock", 0],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalSarees: 0,
      availableSarees: 0,
      outOfStock: 0,
    }
  );
};

const getSaleStats = async (adminId) => {
  const today = new Date();

  const activeSales = await Sale.countDocuments({
    admin: adminId,
    startDate: { $lte: today },
    endDate: { $gte: today },
  });

  return {
    activeSales,
  };
};

const getFollowerStats = async (adminId) => {
  const followers = await User.countDocuments({
    favoriteAdmins: adminId,
  });

  return {
    followers,
  };
};

const getRequestStats = async (adminId) => {
  const stats = await Request.aggregate([
    {
      $match: {
        admin: adminId,
      },
    },
    {
      $group: {
        _id: "$status",

        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const result = {
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
  };

  stats.forEach((item) => {
    if (item._id === "pending") {
      result.pendingRequests = item.count;
    }

    if (item._id === "accepted") {
      result.acceptedRequests = item.count;
    }

    if (item._id === "rejected") {
      result.rejectedRequests = item.count;
    }
  });

  return result;
};

export const getDashboard = async (adminId) => {
  const [
    sareeStats,
    saleStats,
    followerStats,
    requestStats,
  ] = await Promise.all([
    getSareeStats(adminId),
    getSaleStats(adminId),
    getFollowerStats(adminId),
    getRequestStats(adminId),
  ]);

  return {
    overview: {
      ...sareeStats,
      ...saleStats,
      ...followerStats,
      ...requestStats,
    },
  };
};