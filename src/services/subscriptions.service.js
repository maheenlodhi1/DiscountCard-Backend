const httpStatus = require("http-status");
const { Subscriptions, SubscriptionHistory } = require("../models");
const ApiError = require("../utils/ApiError");
const crypto = require("crypto");
const { generateBarcode } = require("../utils/genenrateBarcode");
const getLogger = require("../config/logger");
const logger = getLogger("SubscriptionService");
const SubscriptionTypesServices = require("./subscriptionTypes.service");

const createSubscription = async (subscriptionData) => {
  const subscription = await Subscriptions.create(subscriptionData);
  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, "Something went wrong!");
  }
  return subscription;
};

const findSubscriptionByUserId = async (partnerId) => {
  const subscription = await Subscriptions.findOne({ userId: partnerId });
  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Subscription Found");
  }
  return subscription;
};

const checkMembership = async (barcodeId) => {
  const membership = await Subscriptions.findOne({ barcodeId }).select(
    "-barcode -barcodeId"
  );

  const currentDate = new Date();
  if (!membership) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid or expired barcode!");
  }

  if (membership.expiryDate < currentDate)
    throw new ApiError(httpStatus.NOT_FOUND, "Membership expired");

  return membership;
};

const getMemberships = async (filters, options) => {
  const memberships = await Subscriptions.paginate(filters, options);
  return memberships;
};
const deleteUserSubscription = async (userId) => {
  const subscription = await Subscriptions.findOne({ userId });
  if (!subscription) {
    logger.info(`*** Membership not found for the user ${userId} ***`);
    return;
  }
  return subscription.remove();
};

const rotateMembership = async (userId) => {
  const membership = await Subscriptions.findOne({ userId });
  if (!membership)
    throw new ApiError(httpStatus.NOT_FOUND, "Membership not found!");
  const randomString = crypto.randomBytes(3).toString("hex");
  const timestamp = Date.now().toString().slice(-6);
  const barcodeId = `${randomString}-${timestamp}`;
  const barcode = await generateBarcode(barcodeId);
  membership.barcodeId = barcodeId;
  membership.barcode = barcode;
  return membership.save();
};

const getLastMonthStats = async () => {
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

  const result = await Subscriptions.aggregate([
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

  const membershipMap = new Map(
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
      count: membershipMap.get(dateString) || 0,
    });
  }
  const count = await Subscriptions.count();
  const chartData = {
    count,
    series: [
      {
        name: "Membership Holders",
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

const createMembershipCard = async (customer, targetLang, subscriptionData) => {
  const randomString = crypto.randomBytes(3).toString("hex");
  const timestamp = Date.now().toString().slice(-6);
  const barcodeId = `${randomString}-${timestamp}`;
  const barcode = await generateBarcode(barcodeId);
  const translateData = customer.locale[targetLang];
  const membership = await createSubscription({
    userId: customer.id,
    barcodeId,
    barcode,
    duration: subscriptionData.duration,
    subscriptionType: subscriptionData.id,
    locale: {
      [targetLang]: {
        cardName: `${translateData.firstName} ${translateData.lastName}`,
      },
    },
    status: "active",
  });
  if (!membership) {
    throw new ApiError(
      httpStatus.UNPROCESSABLE_ENTITY,
      "Error while creating Membership"
    );
  }

  return membership;
};

const isValidSubscription = async (subscriptionId) => {
  const subscription = await Subscriptions.findById(subscriptionId);
  if (!subscription) return false;

  const isExpired = subscription.expiryDate < new Date();
  return subscription.status === "active" && !isExpired;
};

const createCustomSubscription = async (data) => {
  const customSubscriptionType =
    await SubscriptionTypesServices.getSubscriptionTypeByName({
      packageType: "custom",
    });
  const subscription = await createSubscription({
    userId: data.userId,
    subscriptionType: customSubscriptionType.id,
  });
  return subscription;
};

const renewSubscription = async (userId, newSubscriptionType) => {
  const activeSubscription = await Subscriptions.findOne({
    userId,
    status: "active",
  });

  if (activeSubscription) {
    // Archive the active subscription
    await SubscriptionHistory.create({
      userId: activeSubscription.userId,
      subscriptionType: activeSubscription.subscriptionType,
      startDate: activeSubscription.startDate,
      expiryDate: activeSubscription.expiryDate,
      status: "expired", // Archive as expired
      duration: activeSubscription.duration,
      archivedAt: new Date(),
    });

    // Remove the active subscription
    await activeSubscription.remove();
  }

  // Create a new active subscription
  const duration = await getSubscriptionDuration(newSubscriptionType); // Fetch duration from subscription type
  const newSubscription = await Subscriptions.create({
    userId,
    subscriptionType: newSubscriptionType,
    startDate: new Date(),
    expiryDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000), // Duration in months
    status: "active",
    duration,
  });

  return newSubscription;
};

module.exports = {
  createSubscription,
  getMemberships,
  deleteUserSubscription,
  rotateMembership,
  checkMembership,
  getLastMonthStats,
  createMembershipCard,
  isValidSubscription,
  createCustomSubscription,
  findSubscriptionByUserId,
};
