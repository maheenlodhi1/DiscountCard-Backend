const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { SubscriptionType } = require("../models");

const createSubscriptionType = async (subscriptionTypeData) => {
  const query = {};

  if (subscriptionTypeData.memberShipType) {
    query.memberShipType = subscriptionTypeData.memberShipType;
  }

  if (subscriptionTypeData.packageType) {
    query.packageType = subscriptionTypeData.packageType;
  }
  const subscription = await SubscriptionType.findOne({
    ...query,
  });

  if (subscription) {
    throw new ApiError(
      httpStatus.ALREADY_REPORTED,
      "Subscription Type already exists"
    );
  }
  const subscriptionType = await SubscriptionType.create(subscriptionTypeData);
  if (!subscriptionType) {
    throw new ApiError(500, "Something went wrong");
  }
  return subscriptionType;
};

const getSubscriptionTypes = async (type) => {
  const subscriptions = await SubscriptionType.find({ type });
  return subscriptions;
};

const getSubscriptionTypeByName = async (options) => {
  const subscription = await SubscriptionType.findOne(options);
  return subscription;
};

const getSubscriptionTypeById = async (subscriptionTypeId) => {
  const subscriptionType = await SubscriptionType.findById(subscriptionTypeId);
  if (!subscriptionType) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription Type not found!");
  }
  return subscriptionType;
};

const updateSubscriptionType = async (subscriptionTypeId, updateBody) => {
  const subscriptionType = await getSubscriptionTypeById(subscriptionTypeId);
  Object.assign(subscriptionType, updateBody);
  await subscriptionType.save();
};

const deleteSubscriptionType = async (subscriptionTypeId) => {
  const subscriptionType = await getSubscriptionTypeById(subscriptionTypeId);
  return subscriptionType.remove();
};
module.exports = {
  createSubscriptionType,
  updateSubscriptionType,
  deleteSubscriptionType,
  getSubscriptionTypeById,
  getSubscriptionTypes,
  getSubscriptionTypeByName,
};
