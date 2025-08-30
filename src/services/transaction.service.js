const httpStatus = require("http-status");
const { Transaction, Review } = require("../models");
const ApiError = require("../utils/ApiError");
const { defaultRanges } = require("../config/constants");
const { default: mongoose } = require("mongoose");
const { ObjectId } = require("mongoose").Types;

const addTransaction = async (transactionData) => {
  const transaction = await Transaction.create(transactionData);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, "Something went wrong!");
  }
  return transaction;
};

const getTransactions = async (filters, options) => {
  const transactions = await Transaction.paginate(filters, options);
  return transactions;
};

const getRawTransactions = async (filters) => {
  filters.isDeleted = false;
  const transactions = await Transaction.find(filters);
  if (!transactions) {
    throw new ApiError(httpStatus.OK, "Transactions not found!");
  }
  return transactions;
};

const createLookupStage = (from, localField, as) => [
  {
    $lookup: {
      from,
      localField,
      foreignField: "_id",
      as,
    },
  },
  { $unwind: { path: `$${as}`, preserveNullAndEmptyArrays: true } },
];

const getTransactionById = async (transactionId, addReview = false) => {
  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(transactionId) } },
    ...createLookupStage("promotions", "promotionId", "promotion"),
    ...createLookupStage("users", "customer", "customer"),
    ...createLookupStage("users", "partner", "partner"),
  ];

  if (addReview) {
    pipeline.push({
      $lookup: {
        from: "reviews",
        let: {
          customerId: "$customer._id",
          partnerId: "$partner._id",
          promotionId: "$promotion._id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$customer", "$$customerId"] },
                  { $eq: ["$partner", "$$partnerId"] },
                  { $eq: ["$promotion", "$$promotionId"] },
                ],
              },
            },
          },
        ],
        as: "review",
      },
    });
    pipeline.push({
      $unwind: { path: "$review", preserveNullAndEmptyArrays: true },
    });
  }
  pipeline.push({
    $addFields: {
      id: "$_id",
      "promotion.id": "$promotion._id",
      "customer.id": "$customer._id",
      "partner.id": "$partner._id",
    },
  });
  pipeline.push({
    $unset: ["_id", "promotion._id", "customer._id", "partner._id"],
  });

  const transactions = await Transaction.aggregate(pipeline);
  return transactions.length ? transactions[0] : null;
};

const getCustomerStats = async (customerId) => {
  const customerIdObjectId = ObjectId(customerId);

  const customerTransactions = await Transaction.aggregate([
    {
      $match: {
        customer: customerIdObjectId,
      },
    },
    {
      $group: {
        _id: "$customer",
        totalSavings: { $sum: "$totalSavings" },
        uniquePromotionIds: { $addToSet: "$promotionId" },
      },
    },
  ]);

  const qrScans = await Transaction.count({ customer: customerId });

  const totalSavings =
    customerTransactions.length > 0
      ? parseInt(customerTransactions[0].totalSavings)
      : 0;
  const uniquePromotionIdsCount =
    customerTransactions.length > 0
      ? customerTransactions[0].uniquePromotionIds.length
      : 0;
  return {
    totalSavings,
    offersRedeemed: uniquePromotionIdsCount,
    qrScans: qrScans,
  };
};

const getPromotionRevenueByAmountRange = async (offerId, year) => {
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  // Aggregate Transactions Data by Revenue Ranges
  const revenueStats = await Transaction.aggregate([
    {
      $match: {
        promotionId: ObjectId(offerId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lte: ["$totalBill", 200] }, then: "0 - 200 AED" },
              {
                case: {
                  $and: [
                    { $gt: ["$totalBill", 200] },
                    { $lte: ["$totalBill", 500] },
                  ],
                },
                then: "200 - 500 AED",
              },
            ],
            default: "500+ AED",
          },
        },
        totalRevenue: { $sum: "$totalBill" },
      },
    },
    {
      $project: {
        range: "$_id",
        totalRevenue: 1,
        _id: 0,
      },
    },
  ]);

  // Map fetched data into the default structure
  revenueStats.forEach((entry) => {
    defaultRanges[entry.range]["count"] = entry.totalRevenue;
  });

  // Format for PieChart
  const chartData = Object.keys(defaultRanges).map((key) => ({
    range: key,
    revenue: defaultRanges[key].count,
    fill: defaultRanges[key].fill,
  }));

  return chartData;
};

module.exports = {
  addTransaction,
  getTransactions,
  getTransactionById,
  getCustomerStats,
  getRawTransactions,
  getPromotionRevenueByAmountRange,
};
