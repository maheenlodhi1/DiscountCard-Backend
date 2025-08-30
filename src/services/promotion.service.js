const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Promotion, Transaction, PromotionEvent } = require("../models");
const { monthNames } = require("../config/constants");
const { default: mongoose } = require("mongoose");
const moment = require("moment");

const createPromotion = async (promotionData) => {
  const alreadyPromotion = await Promotion.findOne({
    partner: promotionData.partner,
  });
  if (alreadyPromotion) {
    throw new ApiError(
      httpStatus.ALREADY_REPORTED,
      "The partner already have an offer!"
    );
  }
  const promotion = await Promotion.create(promotionData);
  if (!promotion) {
    throw new ApiError(500, "Something went wrong");
  }
  return promotion;
};
const getPromotions = async (filters, options) => {
  const promotion = await Promotion.paginate(filters, options);
  return promotion;
};

const getPromotionById = async (promotionId, partnerDetail = false) => {
  let query = Promotion.findOne({ _id: promotionId, isDeleted: false });
  let populateOptions = [{ path: "partner", select: "photoUrl businessName" }];
  if (partnerDetail) {
    populateOptions.push({
      path: "partner",
      select: "email",
    });
  }
  query = query.populate(populateOptions);

  const promotion = await query;
  if (!promotion) {
    throw new ApiError(httpStatus.NOT_FOUND, "Promotion not found!");
  }
  return promotion;
};

const addReviewToPromotion = async (promotionId, reviewId) => {
  const promotion = await Promotion.findByIdAndUpdate(promotionId, {
    $addToSet: { reviews: reviewId },
  });
  return promotion;
};

const updatePromotion = async (promotionId, updateBody) => {
  const promotion = await getPromotionById(promotionId);
  if (promotion.promotionStatus == "rejected") {
  }
  Object.assign(promotion, updateBody);
  return promotion.save();
};

const deletePromotion = async (promotionId) => {
  const promotion = await getPromotionById(promotionId);
  promotion.isDeleted = true;
  return promotion.save();
};

const getRawPromotions = async (filter, options = {}, limit = 12) => {
  filter.isDeleted = false;
  const promotions = await Promotion.find(filter)
    .sort(options)
    .limit(limit)
    .populate("partner locale");
  if (!promotions) {
    throw new ApiError(httpStatus.NOT_FOUND, "Resource not found!");
  }
  return promotions;
};

const getTopRatedPromotions = async (limit = 10) => {
  const result = await Promotion.aggregate([
    { $match: { isActive: true, isDeleted: false } },
    { $addFields: { numberOfReviews: { $size: "$reviews" } } },
    { $sort: { numberOfReviews: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "partner",
        foreignField: "_id",
        as: "partner",
      },
    },
    { $unwind: "$partner" },
    {
      $addFields: {
        id: "$_id",
        "partner.id": "$partner._id",
      },
    },
    {
      $unset: ["_id", "partner._id"],
    },
  ]);

  return result;
};
const getLastMonthStats = async () => {
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

  const result = await Promotion.aggregate([
    {
      $match: {
        createdAt: { $gte: lastMonthDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const offerMap = new Map(
    result.map(({ _id, count }) => [String(_id), count])
  );

  const dateArray = [];
  for (
    let d = new Date(lastMonthDate);
    d <= new Date();
    d.setDate(d.getDate() + 1)
  ) {
    const dateString = new Date(d).toISOString().split("T")[0];
    dateArray.push({
      _id: dateString,
      count: offerMap.get(dateString) || 0,
    });
  }
  const count = await Promotion.count({ isDeleted: false });
  const chartData = {
    count,
    series: [
      {
        name: "Offers Listed",
        data: dateArray.map((item) => item.count),
      },
    ],
    xaxis: {
      type: "datetime",
      categories: dateArray.map((item) => item._id),
    },
  };

  return chartData;
};

const updatePromotionViewOrOrders = async (promotionId, keyToUpdate) => {
  const currentDate = new Date();
  const formattedDate = new Date(
    Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate()
    )
  );

  const resultAddToSet = await Promotion.findOneAndUpdate(
    { _id: promotionId, [`${keyToUpdate}.date`]: { $ne: formattedDate } },
    {
      $addToSet: {
        [keyToUpdate]: { date: formattedDate, count: 0 },
      },
    },
    { new: true }
  );
  const resultIncrementCount = await Promotion.findOneAndUpdate(
    { _id: promotionId, [`${keyToUpdate}.date`]: formattedDate },
    {
      $inc: {
        [`${keyToUpdate}.$.count`]: 1,
      },
    },
    { new: true }
  );
};

const getOfferStatisticsCount = async (offerId, startDate, endDate) => {
  // Default date range (last 12 months if not provided)
  const start = startDate
    ? new Date(startDate)
    : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  const end = endDate ? new Date(endDate) : new Date();

  // Helper function to filter and sum an array field
  const sumFilteredField = (fieldName) => ({
    $sum: {
      $map: {
        input: {
          $filter: {
            input: `$${fieldName}`,
            as: "item",
            cond: {
              $and: [
                { $gte: ["$$item.date", start] },
                { $lte: ["$$item.date", end] },
              ],
            },
          },
        },
        as: "filteredItem",
        in: "$$filteredItem.count",
      },
    },
  });

  // Aggregate Promotion Data (Views & Orders)
  const promotionStats = await Promotion.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(offerId) },
    },
    {
      $project: {
        totalViews: sumFilteredField("views"),
        totalOrders: sumFilteredField("orders"),
      },
    },
  ]);

  // Aggregate Transaction Data (Revenue & Discount)
  const transactionStats = await Transaction.aggregate([
    {
      $match: {
        promotionId: new mongoose.Types.ObjectId(offerId),
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalBill" },
        totalDiscountProvided: { $sum: "$totalSavings" },
      },
    },
  ]);

  // Extract results safely
  const { totalViews = 0, totalOrders = 0 } = promotionStats.length
    ? promotionStats[0]
    : {};
  const { totalRevenue = 0, totalDiscountProvided = 0 } =
    transactionStats.length ? transactionStats[0] : {};

  return {
    totalRevenue,
    totalViews,
    totalOrders,
    totalDiscountProvided,
  };
};

// Helper function to filter and sum monthly data (works for both views and orders)
const aggregateMonthlyData = (fieldName, startDate, endDate) => ({
  $map: {
    input: [...Array(12).keys()], // Create array [0-11] for months
    as: "month",
    in: {
      month: { $add: ["$$month", 1] }, // Convert zero-based index to month number (1-12)
      count: {
        $sum: {
          $map: {
            input: {
              $filter: {
                input: `$${fieldName}`,
                as: "entry",
                cond: {
                  $and: [
                    { $gte: ["$$entry.date", startDate] },
                    { $lte: ["$$entry.date", endDate] },
                    {
                      $eq: [
                        { $month: "$$entry.date" },
                        { $add: ["$$month", 1] },
                      ],
                    },
                  ],
                },
              },
            },
            as: "filteredEntry",
            in: "$$filteredEntry.count",
          },
        },
      },
    },
  },
});

const getOfferYearlyStats = async (offerId, year) => {
  // Start and end date for the selected year
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  // Aggregate Promotion Data (Views & Orders per month)
  const promotionStats = await Promotion.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(offerId) } },
    {
      $project: {
        monthlyViews: aggregateMonthlyData("views", startDate, endDate),
        monthlyOrders: aggregateMonthlyData("orders", startDate, endDate),
      },
    },
  ]);

  // Extract and format data
  const monthlyViews = promotionStats.length
    ? promotionStats[0].monthlyViews
    : [];
  const monthlyOrders = promotionStats.length
    ? promotionStats[0].monthlyOrders
    : [];

  // Combine views and orders into chart-friendly format
  const chartData = monthNames.map((name, index) => ({
    month: name,
    viewed: monthlyViews[index]?.count || 0,
    availed: monthlyOrders[index]?.count || 0,
  }));

  return chartData;
};

const findNearByOffers = async (targetLocation, maxDistance = 50000) => {
  const promotions = await Promotion.find({
    isDeleted: false,
    isActive: true,
    "locations.coordinates": {
      $geoWithin: {
        $centerSphere: [
          [targetLocation.lng, targetLocation.lat],
          maxDistance / 6371,
        ],
      },
    },
  });
  return promotions;
};

const searchPromotions = async (query) => {
  const promotions = await Promotion.find(query);
  return promotions;
};

const getReportPromotions = async () => {
  const promotions = await Promotion.find({ isDeleted: false });
  if (!promotions) {
    throw new ApiError(httpStatus.NOT_FOUND, "Promotions not found!");
  }
  return promotions;
};

const getPartnerPromotions = async (partnerId) => {
  const promotions = await Promotion.find({
    partner: partnerId,
    isDeleted: false,
  });
  if (!Array.isArray(promotions)) {
    throw new ApiError(httpStatus.NOT_FOUND, "Promotions not found!");
  }
  return promotions;
};
const getStartDate = (range) => {
  let startDate = moment(); // Ensure it's a moment instance

  switch (range) {
    case "7days":
      startDate = moment().subtract(7, "days");
      break;
    case "30days":
      startDate = moment().subtract(30, "days");
      break;
    case "90days":
      startDate = moment().subtract(90, "days");
      break;
  }

  return startDate.startOf("day").toDate(); // Ensure correct conversion
};

const getAppDashboardData = async (partnerId, range = "today") => {
  const startDate = getStartDate(range);

  // **1. Get Total Visitors (Sum of all view counts)**
  const visitorsAggregation = await Promotion.aggregate([
    { $match: { partner: new mongoose.Types.ObjectId(partnerId) } },
    { $unwind: "$views" },
    { $match: { "views.date": { $gte: startDate } } },
    { $group: { _id: null, totalVisitors: { $sum: "$views.count" } } },
  ]);
  const totalVisitors = visitorsAggregation[0]?.totalVisitors || 0;

  // **2. Get Total QR Scans (Sum of all order counts)**
  const qrScansAggregation = await Promotion.aggregate([
    { $match: { partner: new mongoose.Types.ObjectId(partnerId) } },
    { $unwind: "$orders" },
    { $match: { "orders.date": { $gte: startDate } } },
    { $group: { _id: null, totalQrScans: { $sum: "$orders.count" } } },
  ]);
  const totalQrScans = qrScansAggregation[0]?.totalQrScans || 0;

  // **3. Get Total Revenue (Sum of totalBill in Transactions)**
  const revenueAggregation = await Transaction.aggregate([
    {
      $match: {
        partner: new mongoose.Types.ObjectId(partnerId),
        date: { $gte: startDate },
      },
    },
    { $group: { _id: null, totalRevenue: { $sum: "$totalBill" } } },
  ]);
  const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

  // **4. Get Revenue Trends for Graph Data (Hourly Revenue)**
  const graphAggregation = await Transaction.aggregate([
    {
      $match: {
        partner: new mongoose.Types.ObjectId(partnerId),
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $hour: "$date" },
        revenue: { $sum: "$totalBill" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // **Format Graph Data for Frontend**
  const graphData = graphAggregation.map((item) => ({
    value: item.revenue,
    label: `${item._id}:00`,
  }));

  return {
    visitors: totalVisitors,
    qrScans: totalQrScans,
    revenue: totalRevenue,
    graphData,
  };
};

const buildFilter = (q = {}) => {
  const filter = {};
  const {
    userId,
    promotionId,
    categoryId,
    categoryName,
    eventType,
    source,
    from,
    to,
  } = q;

  const addObjId = (k, v) => {
    if (v == null) return;
    if (!mongoose.isValidObjectId(v)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `"${k}" must be a valid Mongo ObjectId`
      );
    }
    filter[k] = v;
  };

  addObjId("userId", userId);
  addObjId("promotionId", promotionId);
  addObjId("categoryId", categoryId);

  if (categoryName) filter.categoryName = String(categoryName).trim();

  if (eventType) {
    if (!["view", "click", "redeem"].includes(eventType)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `"eventType" must be one of view|click|redeem`
      );
    }
    filter.eventType = eventType;
  }

  if (source) {
    if (!["app", "synthetic"].includes(source)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `"source" must be app|synthetic`
      );
    }
    filter.source = source;
  }

  // time range
  if (from || to) {
    const ts = {};
    if (from) {
      const d = new Date(from);
      if (isNaN(d))
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `"from" must be a valid date/ISO/epoch`
        );
      ts.$gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (isNaN(d))
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `"to" must be a valid date/ISO/epoch`
        );
      ts.$lte = d;
    }
    filter.timestamp = ts;
  }

  return filter;
};

const buildOptions = (q = {}) => {
  const limit = q.limit ? Math.max(1, parseInt(q.limit, 10)) : 20;
  const page = q.page ? Math.max(1, parseInt(q.page, 10)) : 1;
  const sortBy = q.sortBy || "timestamp:desc";
  return { limit, page, sortBy };
};

const getPromotionEvents = async (query) => {
  const filter = buildFilter(query);
  const options = buildOptions(query);
  return PromotionEvent.paginate(filter, options);
};

module.exports = {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  getLastMonthStats,
  updatePromotionViewOrOrders,
  getOfferYearlyStats,
  addReviewToPromotion,
  getRawPromotions,
  getTopRatedPromotions,
  findNearByOffers,
  searchPromotions,
  getReportPromotions,
  getOfferStatisticsCount,
  getPartnerPromotions,
  getAppDashboardData,
  getPromotionEvents,
};
