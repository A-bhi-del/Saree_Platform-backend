import Saree from "../models/Saree.js";
import Sale from "../models/Sale.js";
import Request from "../models/Request.js";
import User from "../models/User.js";

const fillMissingMonths = (data) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return months.map((month, index) => {
    const found = data.find((item) => item.month === index + 1);

    return {
      month,
      total: found ? found.total : 0,
    };
  });
};

const getYearRange = (year) => {
  return {
    startDate: new Date(year, 0, 1),
    endDate: new Date(year + 1, 0, 1),
  };
};

// const getSareeStats = async (adminId) => {
//   const stats = await Saree.aggregate([
//     {
//       $match: {
//         admin: adminId,
//       },
//     },
//     {
//       $group: {
//         _id: null,

//         totalSarees: {
//           $sum: 1,
//         },

//         availableSarees: {
//           $sum: {
//             $cond: ["$isAvailable", 1, 0],
//           },
//         },

//         outOfStock: {
//           $sum: {
//             $cond: [
//               {
//                 $eq: ["$stock", 0],
//               },
//               1,
//               0,
//             ],
//           },
//         },
//       },
//     },
//   ]);

//   return (
//     stats[0] || {
//       totalSarees: 0,
//       availableSarees: 0,
//       outOfStock: 0,
//     }
//   );
// };

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

// const getRequestStats = async (adminId) => {
//   const stats = await Request.aggregate([
//     {
//       $match: {
//         admin: adminId,
//       },
//     },
//     {
//       $group: {
//         _id: "$status",

//         count: {
//           $sum: 1,
//         },
//       },
//     },
//   ]);

//   const result = {
//     pendingRequests: 0,
//     acceptedRequests: 0,
//     rejectedRequests: 0,
//   };

//   stats.forEach((item) => {
//     if (item._id === "pending") {
//       result.pendingRequests = item.count;
//     }

//     if (item._id === "accepted") {
//       result.acceptedRequests = item.count;
//     }

//     if (item._id === "rejected") {
//       result.rejectedRequests = item.count;
//     }
//   });

//   return result;
// };

// const getMonthlySarees = async (adminId, year) => {
//   const startDate = new Date(year, 0, 1);
//   const endDate = new Date(year + 1, 0, 1);

//   return await Saree.aggregate([
//     {
//       $match: {
//         admin: adminId,
//         createdAt: {
//           $gte: startDate,
//           $lt: endDate
//         }
//       },
//     },

//     {
//       $group: {
//         _id: {
//           month: {
//             $month: "$createdAt",
//           },

//           year: {
//             $year: "$createdAt",
//           },
//         },

//         total: {
//           $sum: 1,
//         },
//       },
//     },

//     {
//       $project: {
//         _id: 0,

//         month: {
//           $arrayElemAt: [
//             [
//               "",
//               "Jan",
//               "Feb",
//               "Mar",
//               "Apr",
//               "May",
//               "Jun",
//               "Jul",
//               "Aug",
//               "Sep",
//               "Oct",
//               "Nov",
//               "Dec",
//             ],

//             "$_id.month",
//           ],
//         },

//         year: "$_id.year",

//         total: 1,
//       },
//     },
//     {
//       $sort: {
//         year: 1,
//         month: 1,
//       },
//     },
//   ]);
// };

// const getMonthlyRequests = async (adminId, year) => {
//   const startDate = new Date(year, 0, 1);
//   const endDate = new Date(year + 1, 0, 1);

//   const monthlyRequests = await Request.aggregate([
//     {
//       $match: {
//         admin: adminId,
//         createdAt: {
//           $gte: startDate,
//           $lt: endDate,
//         },
//       },
//     },
//     {
//       $group: {
//         _id: {
//           month: {
//             $month: "$createdAt",
//           },
//         },

//         total: {
//           $sum: 1,
//         },
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         month: "$_id.month",
//         total: 1,
//       },
//     },
//     {
//       $sort: {
//         month: 1,
//       },
//     },
//   ]);

//   return fillMissingMonths(monthlyRequests);
// };

// const getRequestStatusChart = async (adminId) => {
//   return await Request.aggregate([
//     {
//       $match: {
//         admin: adminId,
//       },
//     },
//     {
//       $group: {
//         _id: "$status",
//         total: {
//           $sum: 1,
//         },
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         status: "$_id",
//         total: 1,
//       },
//     },
//   ]);
// };

const getSareeAnalytics = async (adminId, year) => {
  const { startDate, endDate } = getYearRange(year);

  const analytics = await Saree.aggregate([
    {
      $match: {
        admin: adminId,
      },
    },

    {
      $facet: {
        overview: [
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
        ],

        monthly: [
          {
            $match: {
              createdAt: {
                $gte: startDate,
                $lt: endDate,
              },
            },
          },

          {
            $group: {
              _id: {
                month: {
                  $month: "$createdAt",
                },
              },

              total: {
                $sum: 1,
              },
            },
          },

          {
            $project: {
              _id: 0,
              month: "$_id.month",
              total: 1,
            },
          },

          {
            $sort: {
              month: 1,
            },
          },
        ],

        topCategories: [
          {
            $sortByCount: "$category",
          },

          {
            $limit: 5,
          },

          {
            $project: {
              _id: 0,
              category: "$_id",
              total: "$count",
            },
          },
        ],

        topFabrics: [
          {
            $sortByCount: "$fabric",
          },

          {
            $limit: 5,
          },

          {
            $project: {
              _id: 0,
              fabric: "$_id",
              total: "$count",
            },
          },
        ],

        recentSarees: [
          {
            $sort: {
              createdAt: -1,
            },
          },

          {
            $limit: 5,
          },

          {
            $project: {
              _id: 1,
              name: 1,
              images: 1,
              category: 1,
              fabric: 1,
              color: 1,
              price: 1,
              stock: 1,
              isAvailable: 1,
              discountPercentage: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
  ]);

  const result = analytics[0];

  const overview = result.overview[0] || {
    totalSarees: 0,
    availableSarees: 0,
    outOfStock: 0,
  };

  return {
    overview,

    monthly: fillMissingMonths(result.monthly),

    topCategories: result.topCategories,

    topFabrics: result.topFabrics,

    recentSarees: result.recentSarees,
  };
};
const getRequestAnalytics = async (adminId, year) => {
  const { startDate, endDate } = getYearRange(year);

  const analytics = await Request.aggregate([
    {
      $match: {
        admin: adminId,
      },
    },

    {
      $facet: {
        overview: [
          {
            $group: {
              _id: "$status",
              total: {
                $sum: 1,
              },
            },
          },
        ],

        monthly: [
          {
            $match: {
              createdAt: {
                $gte: startDate,
                $lt: endDate,
              },
            },
          },

          {
            $group: {
              _id: {
                month: {
                  $month: "$createdAt",
                },
              },

              total: {
                $sum: 1,
              },
            },
          },

          {
            $project: {
              _id: 0,
              month: "$_id.month",
              total: 1,
            },
          },

          {
            $sort: {
              month: 1,
            },
          },
        ],

        requestStatus: [
          {
            $group: {
              _id: "$status",

              total: {
                $sum: 1,
              },
            },
          },

          {
            $project: {
              _id: 0,
              status: "$_id",
              total: 1,
            },
          },
        ],

        recentRequests: [
          {
            $sort: {
              createdAt: -1,
            },
          },

          {
            $limit: 5,
          },

          {
            $lookup: {
              from: "users",
              localField: "customer",
              foreignField: "_id",
              as: "customer",
            },
          },

          {
            $unwind: "$customer",
          },

          {
            $project: {
              designName: 1,
              status: 1,
              quantity: 1,
              budget: 1,
              createdAt: 1,

              customer: {
                name: "$customer.name",
                email: "$customer.email",
                profileImage: "$customer.profileImage",
              },
            },
          },
        ],
      },
    },
  ]);

  const result = analytics[0];

  const overview = {
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
  };

  result.overview.forEach((item) => {
    overview[item._id + "Requests"] = item.total;
  });

  return {
    overview,
    monthly: fillMissingMonths(result.monthly),
    requestStatus: result.requestStatus,
    recentRequests: result.recentRequests,
  };
};
export const getDashboard = async (adminId, year) => {
  const [
    sareeAnalytics,
    saleStats,
    followerStats,
    requestAnalytics,
  ] = await Promise.all([
    getSareeAnalytics(adminId, year),
    getSaleStats(adminId),
    getFollowerStats(adminId),
    getRequestAnalytics(adminId, year),
  ]);

  return {
    overview: {
      ...sareeAnalytics.overview,
      ...saleStats,
      ...followerStats,
      ...requestAnalytics.overview,
    },

    charts: {
      monthlySarees: sareeAnalytics.monthly,
      monthlyRequests: requestAnalytics.monthly,
      requestStatus: requestAnalytics.requestStatus,
      topCategories: sareeAnalytics.topCategories,
      topFabrics: sareeAnalytics.topFabrics,
    },

    recentSarees: sareeAnalytics.recentSarees,
    recentRequests: requestAnalytics.recentRequests,
  };
};